namespace Pim.Api.Models;

public class PropertyDefinition
{
    public int Id { get; set; }
    public int ProductTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public DataType DataType { get; set; }
    public bool IsRequired { get; set; }
    public string? OptionsJson { get; set; } // For enum options (array of strings)
    public double? Min { get; set; }
    public double? Max { get; set; }
    public string? Regex { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ProductType? ProductType { get; set; }
} 