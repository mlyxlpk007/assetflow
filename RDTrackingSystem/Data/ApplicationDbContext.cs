using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using RDTrackingSystem.Models;
using RDTrackingSystem.Services;

namespace RDTrackingSystem.Data;

/// <summary>
/// 简化的数据库上下文 - 使用最简单可靠的 SQLite 配置
/// </summary>
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<Models.Task> Tasks { get; set; } = null!;
    public DbSet<TimelineEvent> TimelineEvents { get; set; } = null!;
    public DbSet<LessonLearned> LessonLearned { get; set; } = null!;
    public DbSet<Risk> Risks { get; set; } = null!;
    public DbSet<RiskResponse> RiskResponses { get; set; } = null!;

    // 用于依赖注入的构造函数
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // 无参构造函数用于直接实例化（如 Program.cs 中）
    public ApplicationDbContext() : base()
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ========== User 表配置 ==========
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique().HasDatabaseName("IX_Users_Email");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
        });
        
        // ========== Project 表配置 ==========
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderNumber).IsUnique().HasDatabaseName("IX_Projects_OrderNumber");
            entity.HasIndex(e => e.CurrentStageId).HasDatabaseName("IX_Projects_CurrentStageId");
            entity.HasIndex(e => e.Priority).HasDatabaseName("IX_Projects_Priority");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.OrderNumber).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ProjectName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.LocalPath).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
        });
        
        // ========== Task 表配置 ==========
        modelBuilder.Entity<Models.Task>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ProjectId).HasDatabaseName("IX_Tasks_ProjectId");
            entity.HasIndex(e => e.Status).HasDatabaseName("IX_Tasks_Status");
            entity.HasIndex(e => new { e.ProjectId, e.Status }).HasDatabaseName("IX_Tasks_ProjectId_Status");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.AssignedToJson).HasColumnType("TEXT").HasDefaultValue("[]");
            entity.Property(e => e.TaskType).HasMaxLength(50).HasDefaultValue("project");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
        });
        
        // ========== TimelineEvent 表配置 ==========
        modelBuilder.Entity<TimelineEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(te => te.Project)
                  .WithMany(p => p.TimelineEvents)
                  .HasForeignKey(te => te.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .HasConstraintName("FK_TimelineEvents_Projects");
            entity.HasIndex(e => e.ProjectId).HasDatabaseName("IX_TimelineEvents_ProjectId");
            entity.HasIndex(e => new { e.ProjectId, e.StageId }).HasDatabaseName("IX_TimelineEvents_ProjectId_StageId");
            entity.HasIndex(e => e.Date).HasDatabaseName("IX_TimelineEvents_Date");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ProjectId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Description).HasColumnType("TEXT").IsRequired();
            entity.Property(e => e.TagType).HasMaxLength(50);
            entity.Property(e => e.LessonLearnedId).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
        });
        
        // ========== LessonLearned 表配置 ==========
        modelBuilder.Entity<LessonLearned>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TagType).HasDatabaseName("IX_LessonLearned_TagType");
            entity.HasIndex(e => e.ProjectId).HasDatabaseName("IX_LessonLearned_ProjectId");
            entity.HasIndex(e => e.TaskId).HasDatabaseName("IX_LessonLearned_TaskId");
            entity.HasIndex(e => e.HasReuseValue).HasDatabaseName("IX_LessonLearned_HasReuseValue");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TagType).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Background).HasColumnType("TEXT").IsRequired();
            entity.Property(e => e.RootCause).HasColumnType("TEXT").IsRequired();
            entity.Property(e => e.IfRedo).HasColumnType("TEXT").IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
        });
        
        // ========== Risk 表配置 ==========
        modelBuilder.Entity<Risk>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(r => r.Project)
                  .WithMany()
                  .HasForeignKey(r => r.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .HasConstraintName("FK_Risks_Projects");
            entity.HasIndex(e => e.ProjectId).HasDatabaseName("IX_Risks_ProjectId");
            entity.HasIndex(e => e.Status).HasDatabaseName("IX_Risks_Status");
            entity.HasIndex(e => e.RiskLevel).HasDatabaseName("IX_Risks_RiskLevel");
            entity.HasIndex(e => new { e.ProjectId, e.Status }).HasDatabaseName("IX_Risks_ProjectId_Status");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.ProjectId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Probability).HasDefaultValue(1);
            entity.Property(e => e.Impact).HasDefaultValue(1);
            entity.Property(e => e.RiskLevel).HasDefaultValue(1);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("identified");
            entity.Property(e => e.IdentifiedDate).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
        });
        
        // ========== RiskResponse 表配置 ==========
        modelBuilder.Entity<RiskResponse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(rr => rr.Risk)
                  .WithMany()
                  .HasForeignKey(rr => rr.RiskId)
                  .OnDelete(DeleteBehavior.Cascade)
                  .HasConstraintName("FK_RiskResponses_Risks");
            entity.HasIndex(e => e.RiskId).HasDatabaseName("IX_RiskResponses_RiskId");
            entity.HasIndex(e => e.Status).HasDatabaseName("IX_RiskResponses_Status");
            entity.Property(e => e.Id).HasMaxLength(50).IsRequired();
            entity.Property(e => e.RiskId).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Strategy).HasMaxLength(20).HasDefaultValue("mitigate");
            entity.Property(e => e.ActionPlan).HasColumnType("TEXT").IsRequired();
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("planned");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
        });
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // 如果已经配置过（通过依赖注入），则不再配置
        if (!optionsBuilder.IsConfigured)
        {
            // 使用统一的连接字符串构建器
            DatabaseConnectionHelper.EnsureDatabaseDirectory();
            var connectionString = DatabaseConnectionHelper.BuildConnectionString();
            
            var logger = FileLogger.Instance;
            logger.LogInfo($"配置数据库连接: {DatabaseConnectionHelper.GetNormalizedDatabasePath()}", "ApplicationDbContext");
            
            optionsBuilder.UseSqlite(connectionString, sqliteOptions =>
            {
                sqliteOptions.CommandTimeout(30);
            });
            
            optionsBuilder.EnableSensitiveDataLogging(false);
            optionsBuilder.EnableServiceProviderCaching();
        }
    }

    /// <summary>
    /// 重写 SaveChanges 以设置 PRAGMA（仅在需要时）
    /// </summary>
    public override int SaveChanges()
    {
        EnsurePragma();
        return base.SaveChanges();
    }

    /// <summary>
    /// 重写 SaveChangesAsync 以设置 PRAGMA（仅在需要时）
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        EnsurePragma();
        return await base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// 确保 PRAGMA 设置（确保连接已打开并设置PRAGMA）
    /// </summary>
    private void EnsurePragma()
    {
        try
        {
            var connection = Database.GetDbConnection();
            
            // 如果连接未打开，先打开连接
            if (connection.State != System.Data.ConnectionState.Open)
            {
                connection.Open();
            }
            
            // 设置 PRAGMA（使用原始 SQL 命令）
            // DELETE journal mode 避免 WAL 文件权限问题
            Database.ExecuteSqlRaw("PRAGMA journal_mode=DELETE;");
            Database.ExecuteSqlRaw("PRAGMA foreign_keys=ON;");
        }
        catch (Exception ex)
        {
            // 记录但不抛出异常，让 SQLite 使用默认设置
            var logger = FileLogger.Instance;
            logger.LogWarning($"设置 PRAGMA 时出错: {ex.Message}", "ApplicationDbContext");
        }
    }
}
