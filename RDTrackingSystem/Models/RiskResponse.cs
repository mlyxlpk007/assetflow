using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RDTrackingSystem.Models;

/// <summary>
/// 风险应对措施（应对手册）
/// </summary>
[Table("RiskResponses")]
public class RiskResponse
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(50)]
    public string RiskId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    public string Strategy { get; set; } = "mitigate"; // 应对策略：avoid(规避), mitigate(减轻), transfer(转移), accept(接受)
    
    [Required]
    [Column(TypeName = "TEXT")]
    public string ActionPlan { get; set; } = string.Empty; // 应对措施/行动计划
    
    [MaxLength(100)]
    public string? Responsible { get; set; } // 负责人
    
    [MaxLength(50)]
    public string? Status { get; set; } = "planned"; // 状态：planned(计划中), executing(执行中), completed(已完成), cancelled(已取消)
    
    [MaxLength(50)]
    public string? DueDate { get; set; } // 截止日期
    
    [Column(TypeName = "TEXT")]
    public string? Notes { get; set; } // 备注
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // 导航属性
    [ForeignKey("RiskId")]
    public Risk? Risk { get; set; }
}
