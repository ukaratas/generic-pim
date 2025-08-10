using Microsoft.EntityFrameworkCore;
using Pim.Api.Data;
using Pim.Api.Models;
using System.Text.Json.Serialization;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=/tmp/pim.db"; // Changed for ephemeral Render/Fly.io

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWeb", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddScoped<Pim.Api.Services.AttributeValidationService>();

var app = builder.Build();

app.UseCors("AllowWeb");

// Ensure database is created and migrations applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Serve SPA static files (Angular build will be copied to wwwroot in Docker image)
var defaultFiles = new DefaultFilesOptions();
defaultFiles.DefaultFileNames.Clear();
defaultFiles.DefaultFileNames.Add("index.html");
defaultFiles.DefaultFileNames.Add("browser/index.html");
app.UseDefaultFiles(defaultFiles);
app.UseStaticFiles();

var products = app.MapGroup("/api/products");

products.MapGet("", async (AppDbContext db) =>
{
    var list = await db.Products
        .IgnoreQueryFilters()
        .OrderBy(p => p.Name)
        .ToListAsync();
    return Results.Ok(list);
});

products.MapGet("{id:int}", async (int id, AppDbContext db) =>
{
    var product = await db.Products
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(p => p.Id == id);
    return product is not null ? Results.Ok(product) : Results.NotFound();
});

products.MapPost("", async (Product input, AppDbContext db, Pim.Api.Services.AttributeValidationService validator) =>
{
    input.Id = 0;
    input.IsActive = true;
    input.CreatedAt = DateTime.UtcNow;
    input.UpdatedAt = null;

    var (ok, err) = await validator.ValidateAsync(input.ProductTypeId, input.AttributesJson);
    if (!ok) return Results.BadRequest(new { error = err });

    db.Products.Add(input);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{input.Id}", input);
});

products.MapPut("{id:int}", async (int id, Product update, AppDbContext db, Pim.Api.Services.AttributeValidationService validator) =>
{
    var product = await db.Products.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == id);
    if (product is null) return Results.NotFound();

    var (ok, err) = await validator.ValidateAsync(update.ProductTypeId ?? product.ProductTypeId, update.AttributesJson);
    if (!ok) return Results.BadRequest(new { error = err });

    product.Name = update.Name;
    product.Code = update.Code;
    product.Description = update.Description;
    product.ProductTypeId = update.ProductTypeId;
    product.AttributesJson = update.AttributesJson ?? product.AttributesJson;
    product.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(product);
});

products.MapPut("{id:int}/deactivate", async (int id, AppDbContext db) =>
{
    var product = await db.Products.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == id);
    if (product is null) return Results.NotFound();

    if (!product.IsActive) return Results.NoContent();

    product.IsActive = false;
    product.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

products.MapPut("{id:int}/activate", async (int id, AppDbContext db) =>
{
    var product = await db.Products.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == id);
    if (product is null) return Results.NotFound();

    if (product.IsActive) return Results.NoContent();

    product.IsActive = true;
    product.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Product Types
var productTypes = app.MapGroup("/api/product-types");

productTypes.MapGet("", async (AppDbContext db) =>
{
    var list = await db.ProductTypes.IgnoreQueryFilters().OrderBy(t => t.Name).ToListAsync();
    return Results.Ok(list);
});

productTypes.MapGet("{id:int}", async (int id, AppDbContext db) =>
{
    var type = await db.ProductTypes.IgnoreQueryFilters()
        .Include(t => t.Properties.OrderBy(p => p.SortOrder))
        .FirstOrDefaultAsync(t => t.Id == id);
    return type is not null ? Results.Ok(type) : Results.NotFound();
});

productTypes.MapPost("", async (ProductType input, AppDbContext db) =>
{
    input.Id = 0;
    input.IsActive = true;
    input.CreatedAt = DateTime.UtcNow;
    input.UpdatedAt = null;
    db.ProductTypes.Add(input);
    await db.SaveChangesAsync();
    return Results.Created($"/api/product-types/{input.Id}", input);
});

productTypes.MapPut("{id:int}", async (int id, ProductType update, AppDbContext db) =>
{
    var type = await db.ProductTypes.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
    if (type is null) return Results.NotFound();
    type.Name = update.Name;
    type.Code = update.Code;
    type.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(type);
});

productTypes.MapPut("{id:int}/deactivate", async (int id, AppDbContext db) =>
{
    var type = await db.ProductTypes.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
    if (type is null) return Results.NotFound();
    if (!type.IsActive) return Results.NoContent();
    type.IsActive = false;
    type.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

productTypes.MapPut("{id:int}/activate", async (int id, AppDbContext db) =>
{
    var type = await db.ProductTypes.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.Id == id);
    if (type is null) return Results.NotFound();
    if (type.IsActive) return Results.NoContent();
    type.IsActive = true;
    type.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// Property Definitions
var props = productTypes.MapGroup("{productTypeId:int}/properties");

props.MapGet("", async (int productTypeId, AppDbContext db) =>
{
    var list = await db.PropertyDefinitions.IgnoreQueryFilters()
        .Where(p => p.ProductTypeId == productTypeId)
        .OrderBy(p => p.SortOrder)
        .ToListAsync();
    return Results.Ok(list);
});

props.MapPost("", async (int productTypeId, PropertyDefinition input, AppDbContext db) =>
{
    input.Id = 0;
    input.ProductTypeId = productTypeId;
    input.IsActive = true;
    input.CreatedAt = DateTime.UtcNow;
    input.UpdatedAt = null;
    db.PropertyDefinitions.Add(input);
    await db.SaveChangesAsync();
    return Results.Created($"/api/product-types/{productTypeId}/properties/{input.Id}", input);
});

props.MapPut("{propId:int}", async (int productTypeId, int propId, PropertyDefinition update, AppDbContext db) =>
{
    var prop = await db.PropertyDefinitions.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == propId && p.ProductTypeId == productTypeId);
    if (prop is null) return Results.NotFound();

    prop.Name = update.Name;
    prop.Key = update.Key;
    prop.DataType = update.DataType;
    prop.IsRequired = update.IsRequired;
    prop.OptionsJson = update.OptionsJson;
    prop.Min = update.Min;
    prop.Max = update.Max;
    prop.Regex = update.Regex;
    prop.SortOrder = update.SortOrder;
    prop.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(prop);
});

props.MapPut("{propId:int}/deactivate", async (int productTypeId, int propId, AppDbContext db) =>
{
    var prop = await db.PropertyDefinitions.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == propId && p.ProductTypeId == productTypeId);
    if (prop is null) return Results.NotFound();
    if (!prop.IsActive) return Results.NoContent();
    prop.IsActive = false;
    prop.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

props.MapPut("{propId:int}/activate", async (int productTypeId, int propId, AppDbContext db) =>
{
    var prop = await db.PropertyDefinitions.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == propId && p.ProductTypeId == productTypeId);
    if (prop is null) return Results.NotFound();
    if (prop.IsActive) return Results.NoContent();
    prop.IsActive = true;
    prop.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/health", () => "ok");

// SPA fallback to index.html (index.html or browser/index.html)
app.MapFallback(async context =>
{
    var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    var primary = Path.Combine(webRoot, "index.html");
    var alt = Path.Combine(webRoot, "browser", "index.html");
    var file = File.Exists(primary) ? primary : alt;
    if (!File.Exists(file))
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("SPA index.html not found");
        return;
    }
    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync(file);
});

app.Run();
