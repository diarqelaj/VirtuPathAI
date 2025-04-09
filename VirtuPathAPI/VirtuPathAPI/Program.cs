using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<DailyTaskContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));

builder.Services.AddDbContext<DailyQuoteContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));

builder.Services.AddDbContext<UserContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));

builder.Services.AddDbContext<UserSubscriptionContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));

builder.Services.AddDbContext<TaskCompletionContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));

builder.Services.AddDbContext<PerformanceReviewContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));
   
builder.Services.AddDbContext<CareerPathContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("VirtuPathDB")));



// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add controllers
builder.Services.AddControllers();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS middleware
app.UseCors("AllowAll");

// Enable HTTPS redirection
app.UseHttpsRedirection();

// Enable Authorization middleware
app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
