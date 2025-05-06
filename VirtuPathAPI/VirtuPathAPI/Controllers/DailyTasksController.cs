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
            return Ok(await _context.DailyTasks.ToListAsync());
        }

        [HttpGet("bycareerandday")]
        public async Task<ActionResult<IEnumerable<DailyTask>>> GetByCareerPathAndDay([FromQuery] int careerPathId, [FromQuery] int day)
        {
            if (careerPathId <= 0 || day < 0)
                return BadRequest("Invalid careerPathId or day.");

            var tasks = await _context.DailyTasks
                .Where(t => t.CareerPathID == careerPathId && t.Day == day)
                .ToListAsync();

            return tasks.Any() ? Ok(tasks) : NotFound("No tasks found for that day.");
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DailyTask>> GetById(int id)
        {
            var task = await _context.DailyTasks.FindAsync(id);
            return task != null ? Ok(task) : NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<DailyTask>> Create(DailyTask task)
        {
            if (task == null) return BadRequest("Missing task.");
            _context.DailyTasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = task.TaskID }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DailyTask task)
        {
            if (id != task.TaskID) return BadRequest("Mismatched task ID.");
            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.DailyTasks.Any(e => e.TaskID == id))
                    return NotFound();
                throw;
            }
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTasks()
        {
            string timeZoneId = Request.Headers["X-Timezone"];
            if (string.IsNullOrWhiteSpace(timeZoneId))
                return BadRequest("Missing X-Timezone header.");

            TimeZoneInfo userTimeZone;
            try { userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId); }
            catch { return BadRequest("Invalid timezone."); }

            var nowUtc = DateTime.UtcNow;
            var todayLocal = TimeZoneInfo.ConvertTime(nowUtc, userTimeZone).Date;

            var userId = HttpContext.Session.GetInt32("UserID");
            if (userId == null) return Unauthorized("User not logged in.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized("User not found.");
            if (user.CareerPathID == null) return BadRequest("User has no career path.");

            var lastTaskDate = user.LastTaskDate?.Date ?? DateOnly.MinValue.ToDateTime(TimeOnly.MinValue).Date;

            // ✅ Progress if it's a new local day and user has done 50% of yesterday's tasks
            if (lastTaskDate < todayLocal)
            {
                int previousDay = user.CurrentDay;

                var prevTasks = await _context.DailyTasks
                    .Where(t => t.CareerPathID == user.CareerPathID && t.Day == previousDay)
                    .Select(t => t.TaskID)
                    .ToListAsync();

                var completed = await _context.TaskCompletions
                    .Where(c => c.UserID == user.UserID && c.CareerDay == previousDay)
                    .Select(c => c.TaskID)
                    .ToListAsync();

                int completedCount = completed.Count(id => prevTasks.Contains(id));
                int required = (int)Math.Ceiling(prevTasks.Count * 0.5);

                if (prevTasks.Count > 0 && completedCount >= required)
                {
                    user.CurrentDay += 1;
                    user.LastTaskDate = todayLocal;
                    await _context.SaveChangesAsync();
                }
            }

            var todayTasks = await _context.DailyTasks
                .Where(t => t.CareerPathID == user.CareerPathID && t.Day == user.CurrentDay)
                .ToListAsync();

            return Ok(todayTasks);
        }

        [HttpPost("submit-day")]
        public async Task<IActionResult> SubmitCurrentDay()
        {
            // Just notifies completion — logic stays in GetTodayTasks
            var userId = HttpContext.Session.GetInt32("UserID");
            if (userId == null) return Unauthorized("User not logged in.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized("User not found.");
            if (user.CareerPathID == null) return BadRequest("User has no career path.");

            string timeZoneId = Request.Headers["X-Timezone"];
            if (string.IsNullOrWhiteSpace(timeZoneId)) return BadRequest("Missing timezone.");
            TimeZoneInfo userTimeZone;
            try { userTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId); }
            catch { return BadRequest("Invalid timezone."); }

            var nowUtc = DateTime.UtcNow;
            var todayLocal = TimeZoneInfo.ConvertTime(nowUtc, userTimeZone).Date;
            var lastTaskDate = user.LastTaskDate?.Date ?? DateOnly.MinValue.ToDateTime(TimeOnly.MinValue).Date;

            if (lastTaskDate >= todayLocal)
                return BadRequest("You’ve already submitted for today. Come back tomorrow.");

            var todayTasks = await _context.DailyTasks
                .Where(t => t.CareerPathID == user.CareerPathID && t.Day == user.CurrentDay)
                .Select(t => t.TaskID)
                .ToListAsync();

            var completedTasks = await _context.TaskCompletions
                .Where(tc => tc.UserID == user.UserID && tc.CareerDay == user.CurrentDay)
                .Select(tc => tc.TaskID)
                .ToListAsync();

            int completedCount = completedTasks.Count(id => todayTasks.Contains(id));
            int requiredToPass = (int)Math.Ceiling(todayTasks.Count * 0.5);

            if (todayTasks.Count == 0)
                return BadRequest("No tasks found for today.");
            if (completedCount < requiredToPass)
                return BadRequest($"You must complete at least {requiredToPass} of {todayTasks.Count} tasks.");

            return Ok(new
            {
                message = "✅ Tasks completed. New day will start automatically after midnight.",
                tasksCompleted = completedCount,
                tasksRequired = requiredToPass
            });
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
