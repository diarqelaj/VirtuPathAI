using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskCompletionController : ControllerBase
    {
        private readonly TaskCompletionContext _context;

        public TaskCompletionController(TaskCompletionContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskCompletion>>> GetTaskCompletions()
        {
            return await _context.TaskCompletions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskCompletion>> GetTaskCompletion(int id)
        {
            var completion = await _context.TaskCompletions.FindAsync(id);
            if (completion == null)
                return NotFound();

            return completion;
        }

        [HttpPost]
        public async Task<ActionResult<TaskCompletion>> CreateTaskCompletion(TaskCompletion completion)
        {
            // Step 1: Save the new task completion
            _context.TaskCompletions.Add(completion);
            await _context.SaveChangesAsync();

            try
            {
                // Step 2: Get the user's latest subscription
                var subscription = await _context.UserSubscriptions
                    .Where(s => s.UserID == completion.UserID)
                    .OrderByDescending(s => s.StartDate)
                    .FirstOrDefaultAsync();

                if (subscription != null)
                {
                    int careerPathID = subscription.CareerPathID;
                    int month = completion.CompletionDate.Month;
                    int year = completion.CompletionDate.Year;

                    // Step 3: Count how many tasks are assigned to this career path
                    int totalAssignedTasks = await _context.DailyTasks
                        .Where(t => t.CareerPathID == careerPathID)
                        .CountAsync();

                    // Step 4: Check if a performance review exists
                    var existingReview = await _context.PerformanceReviews.FirstOrDefaultAsync(r =>
                        r.UserID == completion.UserID &&
                        r.CareerPathID == careerPathID &&
                        r.Month == month &&
                        r.Year == year
                    );

                    if (existingReview != null)
                    {
                        // Update existing review
                        existingReview.TasksCompleted += 1;
                        existingReview.PerformanceScore = existingReview.TasksAssigned > 0
                            ? (int)Math.Round((double)existingReview.TasksCompleted / existingReview.TasksAssigned * 100)
                            : 0;

                        _context.PerformanceReviews.Update(existingReview);
                    }
                    else
                    {
                        // Create new review
                        var review = new PerformanceReview
                        {
                            UserID = completion.UserID,
                            CareerPathID = careerPathID,
                            Month = month,
                            Year = year,
                            TasksCompleted = 1,
                            TasksAssigned = totalAssignedTasks,
                            PerformanceScore = totalAssignedTasks > 0
                                ? (int)Math.Round(100.0 / totalAssignedTasks)
                                : 0
                        };

                        await _context.PerformanceReviews.AddAsync(review);
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating performance review: " + ex.Message);
                // Optional: log or handle this non-blocking error
            }

            return CreatedAtAction(nameof(GetTaskCompletion), new { id = completion.CompletionID }, completion);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTaskCompletion(int id, TaskCompletion completion)
        {
            if (id != completion.CompletionID)
                return BadRequest();

            _context.Entry(completion).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaskCompletion(int id)
        {
            var completion = await _context.TaskCompletions.FindAsync(id);
            if (completion == null)
                return NotFound();

            _context.TaskCompletions.Remove(completion);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
