// Program.cs  –  VirtuPathAPI
//------------------------------------------------------------
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using VirtuPathAPI.Models;

var builder = WebApplication.CreateBuilder(args);

//------------------------------------------------------------
// 1)  DATABASE CONTEXTS
//------------------------------------------------------------
string cs = builder.Configuration.GetConnectionString("VirtuPathDB");

builder.Services.AddDbContext<DailyTaskContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<DailyQuoteContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<UserContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<UserSubscriptionContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<TaskCompletionContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<PerformanceReviewContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<CareerPathContext>(opt => opt.UseSqlServer(cs));
builder.Services.AddDbContext<BugReportContext>(opt => opt.UseSqlServer(cs));

//------------------------------------------------------------
// 2)  CORS Policies
//------------------------------------------------------------
builder.Services.AddCors(options =>
{
    // ✅ Allow only the React/Next.js frontend in production
    options.AddPolicy("AllowFrontend", p =>
    {
        p.WithOrigins("https://virtu-path-ai.vercel.app", "https://localhost:3000")
         .AllowCredentials()
         .AllowAnyHeader()
         .AllowAnyMethod();
    });

    // ✅ Allow Swagger UI in development (open policy)
    options.AddPolicy("AllowSwagger", p =>
    {
        p.WithOrigins("https://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials();
    });
});

//------------------------------------------------------------
// 3)  SESSION  (default = 1-minute idle timeout)
//------------------------------------------------------------
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(opt =>
{
    opt.Cookie.Name = ".VirtuPath.Session";
    opt.Cookie.HttpOnly = true;
    opt.Cookie.IsEssential = true;
    opt.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    opt.IdleTimeout = TimeSpan.FromMinutes(1); // short session
});

//------------------------------------------------------------
// 4)  MVC / Swagger
//------------------------------------------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//------------------------------------------------------------
// 5)  BUILD
//------------------------------------------------------------
var app = builder.Build();

//------------------------------------------------------------
// 6)  PIPELINE
//------------------------------------------------------------
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();

// ✅ Allow Swagger CORS in dev
app.UseCors("AllowSwagger");
}
else
{
    // ✅ Use stricter CORS in production
    app.UseCors("AllowFrontend");
}

app.UseHttpsRedirection();

// --- Session must come BEFORE custom middleware -------------
app.UseSession();

app.UseStaticFiles(); // Enables serving wwwroot

//------------------------------------------------------------
// 7)  “REMEMBER-ME” RE-HYDRATE MIDDLEWARE
//------------------------------------------------------------
app.Use(async (ctx, next) =>
{
    const string rememberCookie = "VirtuPathRemember";

    if (ctx.Session.GetInt32("UserID") == null &&
        ctx.Request.Cookies.TryGetValue(rememberCookie, out var raw) &&
        int.TryParse(raw, out var uid))
    {
        ctx.Session.SetInt32("UserID", uid);
    }

    await next();
});

app.UseAuthorization();

app.MapControllers();

app.Run();
