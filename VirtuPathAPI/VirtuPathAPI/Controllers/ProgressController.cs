using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;
using System.Text.Json.Serialization;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProgressController : ControllerBase
    {
        private readonly UserContext _userContext;
        private readonly DailyTaskContext _taskContext;
        private readonly TaskCompletionContext _completionContext;

        public ProgressController(UserContext userContext, DailyTaskContext taskContext, TaskCompletionContext completionContext)
        {
            _userContext = userContext;
            _taskContext = taskContext;
            _completionContext = completionContext;
        }

        [HttpPost("check")]
        public async Task<IActionResult> CheckProgression([FromBody] ProgressionRequest req)
        {   
             Console.WriteLine($"Received ProgressionRequest: UserID={req.UserID}, CareerPathID={req.CareerPathID}, TimeZone={req.TimeZone}");
            TimeZoneInfo tz;
            try
            {
                tz = TimeZoneInfo.FindSystemTimeZoneById(req.TimeZone);
            }
            catch
            {
                return BadRequest("Invalid time zone.");
            }

            var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz).Date;

            // 1. Try UserSubscriptions first
            var subscription = await _completionContext.UserSubscriptions
                .FirstOrDefaultAsync(s => s.UserID == req.UserID && s.CareerPathID == req.CareerPathID);

            if (subscription != null)
            {
                if (subscription.LastAccessedDay >= today.DayOfYear)
                    return Ok("Already progressed today.");

                int day = subscription.LastAccessedDay;

                var tasks = await _taskContext.DailyTasks
                    .Where(t => t.CareerPathID == req.CareerPathID && t.Day == day)
                    .Select(t => t.TaskID)
                    .ToListAsync();

                var completed = await _completionContext.TaskCompletions
                    .Where(t => t.UserID == req.UserID && t.CareerDay == day)
                    .Select(t => t.TaskID)
                    .ToListAsync();

                if (tasks.All(t => completed.Contains(t)))
                {
                    subscription.LastAccessedDay += 1;
                    await _completionContext.SaveChangesAsync();
                    return Ok("Progressed to next day (subscription).");
                }

                return Ok("Tasks not complete (subscription). No progression.");
            }

            // 2. Fallback: use Users table
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.UserID == req.UserID);
            if (user == null || user.CareerPathID != req.CareerPathID)
                return BadRequest("User not found or career path mismatch.");

            if (user.LastTaskDate?.Date >= today)
                return Ok("Already progressed today (user table).");

            int userDay = user.CurrentDay;

            var userTasks = await _taskContext.DailyTasks
                .Where(t => t.CareerPathID == req.CareerPathID && t.Day == userDay)
                .Select(t => t.TaskID)
                .ToListAsync();

            var userCompleted = await _completionContext.TaskCompletions
                .Where(t => t.UserID == req.UserID && t.CareerDay == userDay)
                .Select(t => t.TaskID)
                .ToListAsync();

            if (userTasks.All(t => userCompleted.Contains(t)))
            {
                user.CurrentDay += 1;
                user.LastTaskDate = today;
                await _userContext.SaveChangesAsync();
                return Ok("Progressed to next day (user table).");
            }

            return Ok("Tasks not complete (user table). No progression.");
        }


    }

   

    public class ProgressionRequest
    {
        [JsonPropertyName("userID")]
        public int UserID { get; set; }

        [JsonPropertyName("careerPathID")]
        public int CareerPathID { get; set; }

        [JsonPropertyName("timeZone")]
        public string TimeZone { get; set; }
        
    }


}
