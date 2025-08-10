using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Pim.Api.Data;

namespace Pim.Api.Services;

public class AttributeValidationService
{
    private readonly AppDbContext _db;

    public AttributeValidationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool IsValid, string? Error)> ValidateAsync(int? productTypeId, string attributesJson)
    {
        if (productTypeId is null)
        {
            // No type => allow empty or any attributes for backward compatibility
            return (true, null);
        }

        var defs = await _db.PropertyDefinitions
            .IgnoreQueryFilters()
            .Where(d => d.ProductTypeId == productTypeId && d.IsActive)
            .OrderBy(d => d.SortOrder)
            .ToListAsync();

        JsonObject attrs;
        try
        {
            attrs = JsonNode.Parse(string.IsNullOrWhiteSpace(attributesJson) ? "{}" : attributesJson) as JsonObject
                    ?? new JsonObject();
        }
        catch
        {
            return (false, "Attributes must be a valid JSON object");
        }

        foreach (var def in defs)
        {
            var hasKey = attrs.ContainsKey(def.Key);
            if (def.IsRequired && !hasKey)
                return (false, $"Missing required attribute: {def.Key}");

            if (!hasKey) continue;

            var node = attrs[def.Key];
            switch (def.DataType)
            {
                case Models.DataType.Enum:
                    if (node is null || node.GetValue<string>() is not string s)
                        return (false, $"{def.Key} must be a string");
                    var options = ParseOptions(def.OptionsJson);
                    if (options.Count > 0 && !options.Contains(s))
                        return (false, $"{def.Key} must be one of: {string.Join(", ", options)}");
                    break;
                case Models.DataType.Number:
                    if (!TryGetDouble(node, out var num))
                        return (false, $"{def.Key} must be a number");
                    if (def.Min.HasValue && num < def.Min.Value)
                        return (false, $"{def.Key} must be >= {def.Min}");
                    if (def.Max.HasValue && num > def.Max.Value)
                        return (false, $"{def.Key} must be <= {def.Max}");
                    break;
                case Models.DataType.Text:
                    if (node is null || node.GetValue<string>() is not string t)
                        return (false, $"{def.Key} must be a string");
                    if (!string.IsNullOrWhiteSpace(def.Regex) && !Regex.IsMatch(t, def.Regex))
                        return (false, $"{def.Key} format is invalid");
                    break;
                case Models.DataType.Boolean:
                    if (!TryGetBoolean(node, out _))
                        return (false, $"{def.Key} must be a boolean");
                    break;
                case Models.DataType.Date:
                    if (!TryGetDate(node, out _))
                        return (false, $"{def.Key} must be a date (ISO)");
                    break;
            }
        }

        return (true, null);
    }

    private static List<string> ParseOptions(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            var arr = JsonNode.Parse(json) as JsonArray;
            return arr?.Select(x => x?.GetValue<string>() ?? string.Empty)
                      .Where(x => !string.IsNullOrWhiteSpace(x))
                      .Distinct()
                      .ToList() ?? new List<string>();
        }
        catch { return new List<string>(); }
    }

    private static bool TryGetDouble(JsonNode? node, out double value)
    {
        value = 0;
        if (node is null) return false;
        if (node is JsonValue val && val.TryGetValue(out double d)) { value = d; return true; }
        if (node is JsonValue val2 && val2.TryGetValue(out int i)) { value = i; return true; }
        if (double.TryParse(node.ToJsonString().Trim('"'), out var p)) { value = p; return true; }
        return false;
    }

    private static bool TryGetBoolean(JsonNode? node, out bool value)
    {
        value = false;
        if (node is null) return false;
        if (node is JsonValue val && val.TryGetValue(out bool b)) { value = b; return true; }
        if (bool.TryParse(node.ToJsonString().Trim('"'), out var p)) { value = p; return true; }
        return false;
    }

    private static bool TryGetDate(JsonNode? node, out DateTime value)
    {
        value = default;
        if (node is null) return false;
        if (node is JsonValue val && val.TryGetValue(out DateTime dt)) { value = dt; return true; }
        if (DateTime.TryParse(node.ToJsonString().Trim('"'), out var p)) { value = p; return true; }
        return false;
    }
} 