using Microsoft.EntityFrameworkCore;
using Pim.Api.Models;

namespace Pim.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductType> ProductTypes => Set<ProductType>();
    public DbSet<PropertyDefinition> PropertyDefinitions => Set<PropertyDefinition>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Code).HasMaxLength(100);
            entity.Property(p => p.Description).HasMaxLength(2000);
            entity.HasIndex(p => p.Code).IsUnique(false);
            entity.Property(p => p.AttributesJson).HasColumnType("TEXT").HasDefaultValue("{}");
            entity.HasOne(p => p.ProductType)
                  .WithMany(pt => pt.Products)
                  .HasForeignKey(p => p.ProductTypeId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(p => p.IsActive);
        });

        modelBuilder.Entity<ProductType>(entity =>
        {
            entity.ToTable("ProductTypes");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Code).IsRequired().HasMaxLength(100);
            entity.HasIndex(t => t.Code).IsUnique();
            entity.HasQueryFilter(t => t.IsActive);
        });

        modelBuilder.Entity<PropertyDefinition>(entity =>
        {
            entity.ToTable("PropertyDefinitions");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Key).IsRequired().HasMaxLength(100);
            entity.Property(p => p.OptionsJson).HasColumnType("TEXT");
            entity.HasIndex(p => new { p.ProductTypeId, p.Key }).IsUnique();
            entity.HasOne(p => p.ProductType)
                  .WithMany(t => t.Properties)
                  .HasForeignKey(p => p.ProductTypeId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(p => p.IsActive);
        });

        base.OnModelCreating(modelBuilder);
    }
} 