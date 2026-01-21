namespace RDTrackingSystem.Models.DTOs;

/// <summary>
/// 项目数据传输对象，完全对应数据库 Projects 表
/// </summary>
public class ProjectDto
{
    public string Id { get; set; } = string.Empty;
    public string OrderNumber { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string? SalesName { get; set; }
    public int DeviceQuantity { get; set; }
    public string? Size { get; set; }
    public string? ModuleModel { get; set; }
    public string CurrentStageId { get; set; } = "requirements";
    public string Priority { get; set; } = "medium";
    public string? EstimatedCompletion { get; set; }
    public string? CertificationRequirements { get; set; }
    public string? InstallationEnvironment { get; set; }
    public string? Region { get; set; }
    public string? TechnicalRequirements { get; set; }
    public string? Notes { get; set; }
    public string? LocalPath { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TimelineEventDto> Timeline { get; set; } = new List<TimelineEventDto>();
}

/// <summary>
/// 时间线事件数据传输对象，完全对应数据库 TimelineEvents 表
/// </summary>
public class TimelineEventDto
{
    public string Id { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string StageId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; }
    public DateTime CreatedAt { get; set; }
}
