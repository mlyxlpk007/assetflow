namespace RDTrackingSystem.Models.DTOs;

/// <summary>
/// 风险数据传输对象
/// </summary>
public class RiskDto
{
    public string Id { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int Probability { get; set; }
    public int Impact { get; set; }
    public int RiskLevel { get; set; }
    public string Status { get; set; } = "identified";
    public string? Owner { get; set; }
    public string? RootCause { get; set; }
    public string? Trigger { get; set; }
    public string? Notes { get; set; }
    public DateTime IdentifiedDate { get; set; }
    public DateTime? ExpectedOccurrenceDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<RiskResponseDto>? Responses { get; set; }
}

/// <summary>
/// 风险应对措施数据传输对象
/// </summary>
public class RiskResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string RiskId { get; set; } = string.Empty;
    public string Strategy { get; set; } = "mitigate";
    public string ActionPlan { get; set; } = string.Empty;
    public string? Responsible { get; set; }
    public string? Status { get; set; } = "planned";
    public string? DueDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
