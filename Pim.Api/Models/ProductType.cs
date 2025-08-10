namespace Pim.Api.Models;

public class ProductType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
} 