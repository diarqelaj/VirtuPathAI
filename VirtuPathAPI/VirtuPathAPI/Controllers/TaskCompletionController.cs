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
            _context.TaskCompletions.Add(completion);
            await _context.SaveChangesAsync();
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
