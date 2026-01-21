using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

[Table("TimelineEvents")]
public class TimelineEvent
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string ProjectId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string StageId { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    [Column(TypeName = "TEXT")]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string? AttachmentName { get; set; }
    
    [MaxLength(50)]
    public string? AttachmentType { get; set; }
    
    [MaxLength(50)]
    public string? TagType { get; set; } // 标签类型: rework(返工), delay(延期), defect(缺陷回流), change(临时变更)
    
    [MaxLength(50)]
    public string? LessonLearnedId { get; set; } // 关联的经验教训ID
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    [ForeignKey("ProjectId")]
    public Project? Project { get; set; }
}
