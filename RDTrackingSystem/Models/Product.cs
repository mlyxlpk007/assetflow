using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

[Table("Products")]
public class Product
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Code { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [MaxLength(50)]
    public string? CurrentVersion { get; set; }
    
    [MaxLength(50)]
    public string Status { get; set; } = "active"; // active, archived, deprecated
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    public virtual ICollection<ProductModule> Modules { get; set; } = new List<ProductModule>();
    public virtual ICollection<ProductVersion> Versions { get; set; } = new List<ProductVersion>();
}

[Table("ProductModules")]
public class ProductModule
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string ProductId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // structure, electronic, software, other
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public int OrderIndex { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    [ForeignKey("ProductId")]
    public virtual Product? Product { get; set; }
    
    public virtual ICollection<ProductSubModule> SubModules { get; set; } = new List<ProductSubModule>();
}

[Table("ProductSubModules")]
public class ProductSubModule
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string ModuleId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public int OrderIndex { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    [ForeignKey("ModuleId")]
    public virtual ProductModule? Module { get; set; }
    
    public virtual ICollection<ProductFunction> Functions { get; set; } = new List<ProductFunction>();
}

[Table("ProductFunctions")]
public class ProductFunction
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string SubModuleId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public int OrderIndex { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    [ForeignKey("SubModuleId")]
    public virtual ProductSubModule? SubModule { get; set; }
    
    public virtual ICollection<ProductFunctionAsset> Assets { get; set; } = new List<ProductFunctionAsset>();
    public virtual ICollection<ProductFunctionEngineer> Engineers { get; set; } = new List<ProductFunctionEngineer>();
    public virtual ICollection<ProductFunctionCustomer> Customers { get; set; } = new List<ProductFunctionCustomer>();
    public virtual ICollection<ProductFunctionTask> Tasks { get; set; } = new List<ProductFunctionTask>();
}

[Table("ProductFunctionAssets")]
public class ProductFunctionAsset
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string FunctionId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string AssetId { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? AssetVersion { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("FunctionId")]
    public virtual ProductFunction? Function { get; set; }
}

[Table("ProductFunctionEngineers")]
public class ProductFunctionEngineer
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string FunctionId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string EngineerId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("FunctionId")]
    public virtual ProductFunction? Function { get; set; }
}

[Table("ProductFunctionCustomers")]
public class ProductFunctionCustomer
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string FunctionId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Region { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("FunctionId")]
    public virtual ProductFunction? Function { get; set; }
}

[Table("ProductFunctionTasks")]
public class ProductFunctionTask
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string FunctionId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string TaskId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("FunctionId")]
    public virtual ProductFunction? Function { get; set; }
}

[Table("ProductVersions")]
public class ProductVersion
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string ProductId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Version { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [MaxLength(50)]
    public string Status { get; set; } = "draft"; // draft, beta, stable, deprecated
    
    public DateTime? ReleaseDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [ForeignKey("ProductId")]
    public virtual Product? Product { get; set; }
}
