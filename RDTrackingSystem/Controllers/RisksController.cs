using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RDTrackingSystem.Data;
using RDTrackingSystem.Models;
using RDTrackingSystem.Models.DTOs;
using RDTrackingSystem.Services;

namespace RDTrackingSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RisksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RisksController> _logger;

    public RisksController(ApplicationDbContext context, ILogger<RisksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetProjectRisks(string projectId)
    {
        try
        {
            DatabaseSchemaMigrator.MigrateSchema();
            
            var risks = await _context.Risks
                .Where(r => r.ProjectId == projectId)
                .OrderByDescending(r => r.RiskLevel)
                .ThenByDescending(r => r.IdentifiedDate)
                .ToListAsync();

            var result = risks.Select(r =>
            {
                var responses = _context.RiskResponses
                    .Where(rr => rr.RiskId == r.Id)
                    .Select(rr => new
                    {
                        id = rr.Id,
                        riskId = rr.RiskId,
                        strategy = rr.Strategy,
                        actionPlan = rr.ActionPlan,
                        responsible = rr.Responsible,
                        status = rr.Status,
                        dueDate = rr.DueDate,
                        notes = rr.Notes,
                        createdAt = rr.CreatedAt,
                        updatedAt = rr.UpdatedAt
                    }).ToList();

                return new
                {
                    id = r.Id,
                    projectId = r.ProjectId,
                    description = r.Description,
                    category = r.Category,
                    probability = r.Probability,
                    impact = r.Impact,
                    riskLevel = r.RiskLevel,
                    status = r.Status,
                    owner = r.Owner,
                    rootCause = r.RootCause,
                    trigger = r.Trigger,
                    notes = r.Notes,
                    identifiedDate = r.IdentifiedDate,
                    expectedOccurrenceDate = r.ExpectedOccurrenceDate,
                    createdAt = r.CreatedAt,
                    updatedAt = r.UpdatedAt,
                    responses = responses
                };
            }).ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取项目风险列表失败");
            return StatusCode(500, new { message = "获取项目风险列表失败", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetRisk(string id)
    {
        var risk = await _context.Risks.FindAsync(id);
        if (risk == null)
        {
            return NotFound();
        }

        var responses = await _context.RiskResponses
            .Where(rr => rr.RiskId == id)
            .ToListAsync();

        return Ok(new
        {
            id = risk.Id,
            projectId = risk.ProjectId,
            description = risk.Description,
            category = risk.Category,
            probability = risk.Probability,
            impact = risk.Impact,
            riskLevel = risk.RiskLevel,
            status = risk.Status,
            owner = risk.Owner,
            rootCause = risk.RootCause,
            trigger = risk.Trigger,
            notes = risk.Notes,
            identifiedDate = risk.IdentifiedDate,
            expectedOccurrenceDate = risk.ExpectedOccurrenceDate,
            createdAt = risk.CreatedAt,
            updatedAt = risk.UpdatedAt,
            responses = responses.Select(rr => new
            {
                id = rr.Id,
                riskId = rr.RiskId,
                strategy = rr.Strategy,
                actionPlan = rr.ActionPlan,
                responsible = rr.Responsible,
                status = rr.Status,
                dueDate = rr.DueDate,
                notes = rr.Notes,
                createdAt = rr.CreatedAt,
                updatedAt = rr.UpdatedAt
            }).ToList()
        });
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateRisk([FromBody] dynamic riskData)
    {
        try
        {
            DatabaseSchemaMigrator.MigrateSchema();
            
            if (riskData == null)
            {
                return BadRequest(new { error = "风险数据为空" });
            }

            int probability = riskData.probability != null ? (int)riskData.probability : 1;
            int impact = riskData.impact != null ? (int)riskData.impact : 1;
            int riskLevel = probability * impact; // 风险等级 = 概率 × 影响

            var risk = new Risk
            {
                Id = riskData.id?.ToString() ?? Guid.NewGuid().ToString(),
                ProjectId = riskData.projectId?.ToString() ?? string.Empty,
                Description = riskData.description?.ToString() ?? string.Empty,
                Category = riskData.category?.ToString(),
                Probability = probability,
                Impact = impact,
                RiskLevel = riskLevel,
                Status = riskData.status?.ToString() ?? "identified",
                Owner = riskData.owner?.ToString(),
                RootCause = riskData.rootCause?.ToString(),
                Trigger = riskData.trigger?.ToString(),
                Notes = riskData.notes?.ToString(),
                IdentifiedDate = riskData.identifiedDate != null 
                    ? DateTime.Parse(riskData.identifiedDate.ToString()) 
                    : DateTime.Now,
                ExpectedOccurrenceDate = riskData.expectedOccurrenceDate != null
                    ? DateTime.Parse(riskData.expectedOccurrenceDate.ToString())
                    : null,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Risks.Add(risk);
            await _context.SaveChangesAsync();

            return Ok(new { id = risk.Id, message = "风险创建成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "创建风险失败");
            return StatusCode(500, new { message = "创建风险失败", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateRisk(string id, [FromBody] dynamic riskData)
    {
        var risk = await _context.Risks.FindAsync(id);
        if (risk == null)
        {
            return NotFound();
        }

        try
        {
            if (riskData.description != null)
                risk.Description = riskData.description.ToString();
            if (riskData.category != null)
                risk.Category = riskData.category.ToString();
            if (riskData.probability != null)
                risk.Probability = (int)riskData.probability;
            if (riskData.impact != null)
                risk.Impact = (int)riskData.impact;
            
            // 重新计算风险等级
            risk.RiskLevel = risk.Probability * risk.Impact;
            
            if (riskData.status != null)
                risk.Status = riskData.status.ToString();
            if (riskData.owner != null)
                risk.Owner = riskData.owner.ToString();
            if (riskData.rootCause != null)
                risk.RootCause = riskData.rootCause.ToString();
            if (riskData.trigger != null)
                risk.Trigger = riskData.trigger.ToString();
            if (riskData.notes != null)
                risk.Notes = riskData.notes.ToString();
            if (riskData.expectedOccurrenceDate != null)
                risk.ExpectedOccurrenceDate = DateTime.Parse(riskData.expectedOccurrenceDate.ToString());

            risk.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "风险更新成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新风险失败");
            return StatusCode(500, new { message = "更新风险失败", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRisk(string id)
    {
        var risk = await _context.Risks.FindAsync(id);
        if (risk == null)
        {
            return NotFound();
        }

        _context.Risks.Remove(risk);
        await _context.SaveChangesAsync();
        return Ok(new { message = "风险删除成功" });
    }

    [HttpPost("{riskId}/responses")]
    public async Task<ActionResult<object>> CreateRiskResponse(string riskId, [FromBody] dynamic responseData)
    {
        try
        {
            DatabaseSchemaMigrator.MigrateSchema();
            
            var risk = await _context.Risks.FindAsync(riskId);
            if (risk == null)
            {
                return NotFound(new { error = "风险不存在" });
            }

            var response = new RiskResponse
            {
                Id = responseData.id?.ToString() ?? Guid.NewGuid().ToString(),
                RiskId = riskId,
                Strategy = responseData.strategy?.ToString() ?? "mitigate",
                ActionPlan = responseData.actionPlan?.ToString() ?? string.Empty,
                Responsible = responseData.responsible?.ToString(),
                Status = responseData.status?.ToString() ?? "planned",
                DueDate = responseData.dueDate?.ToString(),
                Notes = responseData.notes?.ToString(),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.RiskResponses.Add(response);
            await _context.SaveChangesAsync();

            return Ok(new { id = response.Id, message = "应对措施创建成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "创建应对措施失败");
            return StatusCode(500, new { message = "创建应对措施失败", error = ex.Message });
        }
    }

    [HttpPut("responses/{id}")]
    public async Task<ActionResult> UpdateRiskResponse(string id, [FromBody] dynamic responseData)
    {
        var response = await _context.RiskResponses.FindAsync(id);
        if (response == null)
        {
            return NotFound();
        }

        try
        {
            if (responseData.strategy != null)
                response.Strategy = responseData.strategy.ToString();
            if (responseData.actionPlan != null)
                response.ActionPlan = responseData.actionPlan.ToString();
            if (responseData.responsible != null)
                response.Responsible = responseData.responsible.ToString();
            if (responseData.status != null)
                response.Status = responseData.status.ToString();
            if (responseData.dueDate != null)
                response.DueDate = responseData.dueDate.ToString();
            if (responseData.notes != null)
                response.Notes = responseData.notes.ToString();

            response.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "应对措施更新成功" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "更新应对措施失败");
            return StatusCode(500, new { message = "更新应对措施失败", error = ex.Message });
        }
    }

    [HttpDelete("responses/{id}")]
    public async Task<ActionResult> DeleteRiskResponse(string id)
    {
        var response = await _context.RiskResponses.FindAsync(id);
        if (response == null)
        {
            return NotFound();
        }

        _context.RiskResponses.Remove(response);
        await _context.SaveChangesAsync();
        return Ok(new { message = "应对措施删除成功" });
    }
}
