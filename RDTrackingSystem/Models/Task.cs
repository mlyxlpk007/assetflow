using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

[Table("Tasks")]
public class Task
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? ProjectId { get; set; }
    
    [Column(TypeName = "TEXT")]
    public string AssignedToJson { get; set; } = "[]";
    
    [MaxLength(50)]
    public string StartDate { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string EndDate { get; set; } = string.Empty;
    
    [Column(TypeName = "TEXT")]
    public string? Requirements { get; set; } // 任务要求/工作内容
    
    [MaxLength(100)]
    public string? Stakeholder { get; set; } // 利益方
    
    [MaxLength(20)]
    public string? Priority { get; set; } // 优先级: high, medium, low
    
    [MaxLength(20)]
    public string? Status { get; set; } = "pending"; // 状态: pending, in_progress, completed, cancelled
    
    [MaxLength(50)]
    public string? TaskType { get; set; } = "project"; // 任务类型: project(项目任务), rnd(研发任务), leave(请假), meeting(开会), support(技术性支持)
    
    [MaxLength(50)]
    public string? CompletedDate { get; set; } // 完成日期
    
    [Column(TypeName = "TEXT")]
    public string? CompletionNotes { get; set; } // 完成备注/说明
    
    [MaxLength(100)]
    public string? CompletedBy { get; set; } // 完成人
    
    [MaxLength(50)]
    public string? TagType { get; set; } // 标签类型: rework(返工), delay(延期), defect(缺陷回流), change(临时变更)
    
    [MaxLength(50)]
    public string? LessonLearnedId { get; set; } // 关联的经验教训ID
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
