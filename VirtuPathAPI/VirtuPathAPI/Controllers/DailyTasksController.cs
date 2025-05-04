using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;
using System.Linq;
using System.Threading.Tasks;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DailyTasksController : ControllerBase
    {
        private readonly DailyTaskContext _context;

        public DailyTasksController(DailyTaskContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DailyTask>>> GetAll()
        {
            var tasks = await _context.DailyTasks.ToListAsync();
            return Ok(tasks);
        }

        [HttpGet("bycareerandday")]
        public async Task<ActionResult<IEnumerable<DailyTask>>> GetByCareerPathAndDay([FromQuery] int careerPathId, [FromQuery] int day)
        {
            if (careerPathId <= 0 || day < 0)
             return BadRequest("Invalid careerPathId or day value.");


            var tasks = await _context.DailyTasks
                .Where(t => t.CareerPathID == careerPathId && t.Day == day)
                .ToListAsync();

            if (!tasks.Any())
                return NotFound("No tasks found for the specified CareerPathID and Day.");

            return Ok(tasks);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DailyTask>> GetById(int id)
        {
            var task = await _context.DailyTasks.FindAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<DailyTask>> Create(DailyTask task)
        {
            if (task == null)
                return BadRequest("Task data is required.");

            _context.DailyTasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = task.TaskID }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DailyTask task)
        {
            if (id != task.TaskID)
                return BadRequest("Task ID mismatch.");

            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.DailyTasks.Any(e => e.TaskID == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTasks()
        {
            string timeZoneId = Request.Headers["X-Timezone"];
            if (string.IsNullOrWhiteSpace(timeZoneId))
                return BadRequest("Missing X-Timezone header.");

            TimeZoneInfo userTimeZone;
            try
            {
                userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            }
            catch (TimeZoneNotFoundException)
            {
                return BadRequest("Invalid time zone.");
            }

           
            var simulatedNow = new DateTime(2025, 5, 6, 1, 0, 0); // simulate May 6th, 1AM
            var todayDate = TimeZoneInfo.ConvertTime(simulatedNow, userTimeZone);


            Console.WriteLine("🔍 [DailyTasks/today] Debug:");
            Console.WriteLine($"  TimeZone: {timeZoneId}");
            Console.WriteLine($"  UTC Now: {DateTime.UtcNow}");
            Console.WriteLine($"  Converted Now: {todayDate}");
            Console.WriteLine($"  Today Date: {todayDate}");

            var userEmail = User?.Identity?.Name;
            User? user = null;

            if (!string.IsNullOrWhiteSpace(userEmail))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
                Console.WriteLine($"  Authenticated user by email: {userEmail}");
            }
            else
            {
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                if (!string.IsNullOrWhiteSpace(ip))
                {
                    if (ip == "::1") ip = "127.0.0.1";
                    Console.WriteLine($"  IP fallback: Normalized IP = {ip}");
                    user = await _context.Users.FirstOrDefaultAsync(u => u.LastKnownIP == ip);
                }
            }

            if (user == null)
            {
                Console.WriteLine("❌ User not found.");
                return Unauthorized("User not found.");
            }

            Console.WriteLine($"  UserID: {user.UserID}, CareerPathID: {user.CareerPathID}, CurrentDay: {user.CurrentDay}, LastTaskDate: {user.LastTaskDate}");

            if (user.CareerPathID == null)
                return BadRequest("User has not selected a career path.");

            if (user.LastTaskDate == null || user.LastTaskDate.Value.Date < todayDate)
            {
                var previousDay = user.CurrentDay;

                var prevTasks = await _context.DailyTasks
                    .Where(t => t.CareerPathID == user.CareerPathID && t.Day == previousDay)
                    .Select(t => t.TaskID)
                    .ToListAsync();

                var completed = await _context.TaskCompletions
                    .Where(tc => tc.UserID == user.UserID && tc.CareerDay == previousDay)
                    .Select(tc => tc.TaskID)
                    .ToListAsync();

                bool allCompleted = prevTasks.All(id => completed.Contains(id));

                Console.WriteLine($"  PreviousDay: {previousDay}");
                Console.WriteLine($"  PrevTasks: {string.Join(",", prevTasks)}");
                Console.WriteLine($"  Completed: {string.Join(",", completed)}");
                Console.WriteLine($"  All Completed: {allCompleted}");

                if (allCompleted)
                {
                    user.CurrentDay += 1;
                    user.LastTaskDate = todayDate;
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"  ✅ Progressed to Day: {user.CurrentDay}");
                }
            }

            var todayTasks = await _context.DailyTasks
                .Where(t => t.CareerPathID == user.CareerPathID && t.Day == user.CurrentDay)
                .ToListAsync();

            Console.WriteLine($"  🎯 Tasks returned: {todayTasks.Count}");
            return Ok(todayTasks);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.DailyTasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.DailyTasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
