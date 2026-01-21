using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

[Table("Projects")]
public class Project
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(100)]
    
    public string OrderNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string ProjectName { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? SalesName { get; set; }
    
    public int DeviceQuantity { get; set; }
    
    [MaxLength(50)]
    public string? Size { get; set; }
    
    [MaxLength(100)]
    public string? ModuleModel { get; set; }
    
    [MaxLength(50)]
    public string CurrentStageId { get; set; } = "requirements";
    
    [MaxLength(20)]
    public string Priority { get; set; } = "medium";
    
    [MaxLength(50)]
    public string? EstimatedCompletion { get; set; }
    
    [MaxLength(500)]
    public string? CertificationRequirements { get; set; }
    
    [MaxLength(200)]
    public string? InstallationEnvironment { get; set; }
    
    [MaxLength(100)]
    public string? Region { get; set; }
    
    [Column(TypeName = "TEXT")]
    public string? TechnicalRequirements { get; set; }
    
    [Column(TypeName = "TEXT")]
    public string? Notes { get; set; }
    
    [MaxLength(500)]
    public string? LocalPath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // 导航属性：时间线事件
    public virtual ICollection<TimelineEvent> TimelineEvents { get; set; } = new List<TimelineEvent>();
}
