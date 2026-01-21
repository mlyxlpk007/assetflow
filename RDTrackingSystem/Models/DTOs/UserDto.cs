namespace RDTrackingSystem.Models.DTOs;

/// <summary>
/// 用户数据传输对象，完全对应数据库 Users 表
/// </summary>
public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    
    // 人员技能和能力信息
    public string? SkillTags { get; set; } // JSON格式的技能标签数组
    public int MaxConcurrentTasks { get; set; } = 5;
    public double AvailabilityRate { get; set; } = 1.0;
    public double LeavePercentage { get; set; } = 0.0;
    public double MeetingPercentage { get; set; } = 0.1;
    public double SupportWorkPercentage { get; set; } = 0.1;
}
