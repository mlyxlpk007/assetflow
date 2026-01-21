using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

/// <summary>
/// 项目风险（风险登记册）
/// </summary>
[Table("Risks")]
public class Risk
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string ProjectId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty; // 风险描述
    
    [MaxLength(100)]
    public string? Category { get; set; } // 风险类别：技术、进度、成本、质量、资源、外部等
    
    [Required]
    public int Probability { get; set; } = 1; // 风险概率（1-5，1=很低，5=很高）
    
    [Required]
    public int Impact { get; set; } = 1; // 风险影响（1-5，1=很低，5=很高）
    
    [Required]
    public int RiskLevel { get; set; } = 1; // 风险等级（概率×影响，1-25）
    
    [MaxLength(20)]
    public string Status { get; set; } = "identified"; // 风险状态：identified(已识别), analyzed(已分析), responded(已应对), monitored(监控中), closed(已关闭)
    
    [MaxLength(100)]
    public string? Owner { get; set; } // 风险责任人
    
    [Column(TypeName = "TEXT")]
    public string? RootCause { get; set; } // 根本原因
    
    [Column(TypeName = "TEXT")]
    public string? Trigger { get; set; } // 风险触发条件
    
    [Column(TypeName = "TEXT")]
    public string? Notes { get; set; } // 备注
    
    public DateTime IdentifiedDate { get; set; } = DateTime.Now; // 识别日期
    
    public DateTime? ExpectedOccurrenceDate { get; set; } // 预期发生日期
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    [ForeignKey("ProjectId")]
    public Project? Project { get; set; }
}
