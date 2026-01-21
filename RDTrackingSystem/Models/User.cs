using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

[Table("Users")]
public class User
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Avatar { get; set; }
    
    [MaxLength(200)]
    public string? PasswordHash { get; set; }
    
    // 人员技能和能力信息
    [Column(TypeName = "TEXT")]
    public string? SkillTags { get; set; } // JSON格式存储技能标签数组，例如：["硬件设计","嵌入式开发","PCB设计"]
    
    public int MaxConcurrentTasks { get; set; } = 5; // 并行任务上限，默认5
    
    [Column(TypeName = "REAL")]
    public double AvailabilityRate { get; set; } = 1.0; // 可用率，0.0-1.0，默认1.0（100%）
    
    [Column(TypeName = "REAL")]
    public double LeavePercentage { get; set; } = 0.0; // 请假占比，0.0-1.0，默认0.0
    
    [Column(TypeName = "REAL")]
    public double MeetingPercentage { get; set; } = 0.1; // 会议占比，0.0-1.0，默认0.1（10%）
    
    [Column(TypeName = "REAL")]
    public double SupportWorkPercentage { get; set; } = 0.1; // 支撑性工作占比，0.0-1.0，默认0.1（10%）
}
