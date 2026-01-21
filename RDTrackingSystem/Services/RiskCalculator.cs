using Microsoft.EntityFrameworkCore;
using RDTrackingSystem.Data;
using RDTrackingSystem.Models;

namespace RDTrackingSystem.Services;

/// <summary>
/// 项目风险值计算服务（基于PMP风险管理理论）
/// </summary>
public static class RiskCalculator
{
    /// <summary>
    /// 计算项目的总体风险值（0-100）
    /// 基于PMP风险矩阵：风险值 = 加权平均风险等级 × 4（转换为0-100）
    /// </summary>
    public static int CalculateProjectRiskValue(ApplicationDbContext context, string projectId)
    {
        try
        {
            var risks = context.Risks
                .Where(r => r.ProjectId == projectId && r.Status != "closed")
                .ToList();

            if (risks.Count == 0)
            {
                return 0; // 没有风险，风险值为0
            }

            // 计算加权平均风险等级
            // 高风险（15-25）权重更高
            double totalWeightedRisk = 0;
            double totalWeight = 0;

            foreach (var risk in risks)
            {
                // 根据风险等级分配权重
                // 高风险（15-25）权重为3，中风险（8-14）权重为2，低风险（1-7）权重为1
                double weight = risk.RiskLevel >= 15 ? 3.0 : (risk.RiskLevel >= 8 ? 2.0 : 1.0);
                
                totalWeightedRisk += risk.RiskLevel * weight;
                totalWeight += weight;
            }

            if (totalWeight == 0)
            {
                return 0;
            }

            double averageRiskLevel = totalWeightedRisk / totalWeight;
            
            // 将风险等级（1-25）转换为风险值（0-100）
            // 使用非线性转换，高风险更突出
            int riskValue = (int)Math.Round((averageRiskLevel / 25.0) * 100);
            
            // 考虑未应对的风险数量，增加风险值
            int unrespondedRisks = risks.Count(r => r.Status == "identified" || r.Status == "analyzed");
            if (unrespondedRisks > 0)
            {
                // 每个未应对的风险增加2-5点风险值
                riskValue += Math.Min(unrespondedRisks * 3, 20);
            }

            return Math.Min(riskValue, 100); // 确保不超过100
        }
        catch (Exception)
        {
            return 0;
        }
    }

    /// <summary>
    /// 获取风险值的颜色（用于UI显示）
    /// </summary>
    public static string GetRiskColor(int riskValue)
    {
        if (riskValue >= 70)
            return "bg-red-500"; // 高风险 - 红色
        else if (riskValue >= 40)
            return "bg-yellow-500"; // 中风险 - 黄色
        else if (riskValue >= 20)
            return "bg-orange-500"; // 中低风险 - 橙色
        else
            return "bg-green-500"; // 低风险 - 绿色
    }

    /// <summary>
    /// 获取风险值的文本描述
    /// </summary>
    public static string GetRiskLevelText(int riskValue)
    {
        if (riskValue >= 70)
            return "高风险";
        else if (riskValue >= 40)
            return "中风险";
        else if (riskValue >= 20)
            return "中低风险";
        else
            return "低风险";
    }
}
