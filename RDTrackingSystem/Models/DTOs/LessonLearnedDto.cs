namespace RDTrackingSystem.Models.DTOs;

/// <summary>
/// 经验教训数据传输对象
/// </summary>
public class LessonLearnedDto
{
    public string Id { get; set; } = string.Empty;
    public string TagType { get; set; } = string.Empty;
    public string? ProjectId { get; set; }
    public string? TaskId { get; set; }
    public string? TimelineEventId { get; set; }
    public string Background { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string IfRedo { get; set; } = string.Empty;
    public bool HasReuseValue { get; set; }
    public string? RelatedProjectName { get; set; }
    public string? RelatedTaskName { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
