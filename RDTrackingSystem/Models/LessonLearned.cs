using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

/// <summary>
/// 经验教训库
/// </summary>
[Table("LessonLearned")]
public class LessonLearned
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string TagType { get; set; } = string.Empty; // 标签类型: rework(返工), delay(延期), defect(缺陷回流), change(临时变更)
    
    [MaxLength(50)]
    public string? ProjectId { get; set; } // 关联的项目ID（可选）
    
    [MaxLength(50)]
    public string? TaskId { get; set; } // 关联的任务ID（可选）
    
    [MaxLength(50)]
    public string? TimelineEventId { get; set; } // 关联的时间线事件ID（可选）
    
    [Required]
    [Column(TypeName = "TEXT")]
    public string Background { get; set; } = string.Empty; // 背景（发生了什么）
    
    [Required]
    [Column(TypeName = "TEXT")]
    public string RootCause { get; set; } = string.Empty; // 根因（不是人，是系统）
    
    [Required]
    [Column(TypeName = "TEXT")]
    public string IfRedo { get; set; } = string.Empty; // 如果重来一次会怎么做
    
    [Required]
    public bool HasReuseValue { get; set; } = false; // 是否具有复用价值
    
    [MaxLength(200)]
    public string? RelatedProjectName { get; set; } // 关联项目名称（冗余字段，方便查询）
    
    [MaxLength(200)]
    public string? RelatedTaskName { get; set; } // 关联任务名称（冗余字段，方便查询）
    
    [MaxLength(100)]
    public string? CreatedBy { get; set; } // 创建人
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
