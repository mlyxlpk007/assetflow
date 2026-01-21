using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RDTrackingSystem.Data;

namespace RDTrackingSystem.Services;

public class ApiServer
{
    private WebApplication? _app;
    private readonly int _port = 5000;

    public void Start()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions());
        
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });
        
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            // 使用统一的连接字符串构建器
            DatabaseConnectionHelper.EnsureDatabaseDirectory();
            var connectionString = DatabaseConnectionHelper.BuildConnectionString();
            
            options.UseSqlite(connectionString, sqliteOptions =>
            {
                sqliteOptions.CommandTimeout(30);
            });
            
            options.EnableSensitiveDataLogging(false);
            options.EnableServiceProviderCaching();
        });
        
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        
        builder.WebHost.UseUrls($"http://localhost:{_port}");
        
        _app = builder.Build();
        
        _app.UseCors("AllowAll");
        _app.UseRouting();
        
        // 提供静态文件服务（用于 Web 应用）
        var wwwrootPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
        if (Directory.Exists(wwwrootPath))
        {
            _app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(wwwrootPath),
                RequestPath = "",
                OnPrepareResponse = ctx =>
                {
                    // 禁用缓存以确保总是加载最新文件
                    var headers = ctx.Context.Response.Headers;
                    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                    headers["Pragma"] = "no-cache";
                    headers["Expires"] = "0";
                }
            });
        }
        
        _app.MapControllers();
        
        // 默认路由到 index.html（用于 SPA）
        if (Directory.Exists(wwwrootPath))
        {
            _app.MapFallbackToFile("index.html");
        }
        
        _app.RunAsync();
    }

    public async void Stop()
    {
        if (_app != null)
        {
            await _app.StopAsync();
            await _app.DisposeAsync();
        }
    }

    public string GetBaseUrl()
    {
        return $"http://localhost:{_port}";
    }
}
