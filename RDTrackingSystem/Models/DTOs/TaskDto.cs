namespace RDTrackingSystem.Models.DTOs;

/// <summary>
/// 任务数据传输对象，完全对应数据库 Tasks 表
/// </summary>
public class TaskDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ProjectId { get; set; }
    public List<string> AssignedTo { get; set; } = new List<string>();
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Stakeholder { get; set; }
    public string Priority { get; set; } = "medium";
    public string Status { get; set; } = "pending";
    public string? TaskType { get; set; } = "project";
    public string? CompletedDate { get; set; }
    public string? CompletionNotes { get; set; }
    public string? CompletedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
