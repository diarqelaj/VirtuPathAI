using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using VirtuPathAPI.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

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

            // GET: api/DailyTasks
            [HttpGet]
            public async Task<ActionResult<IEnumerable<DailyTask>>> GetAll()
            {
                return await _context.DailyTasks.ToListAsync();
            }

        // GET: api/DailyTasks/bycareerandday?careerPathId=3&day=1
        [HttpGet("bycareerandday")]
        public async Task<ActionResult<IEnumerable<DailyTask>>> GetByCareerPathAndDay([FromQuery] int careerPathId, [FromQuery] int day)
        {
            var tasks = await _context.DailyTasks
                .Where(t => t.CareerPathID == careerPathId && t.Day == day)
                .ToListAsync();

            if (!tasks.Any())
                return NotFound("No tasks found for the specified CareerPathID and Day.");

            return tasks;
        }


        // GET: api/DailyTasks/{id}
        [HttpGet("{id:int}")]
            public async Task<ActionResult<DailyTask>> GetById(int id)
            {
                var task = await _context.DailyTasks.FindAsync(id);
                if (task == null)
                    return NotFound();

                return task;
            }

            // POST: api/DailyTasks
            [HttpPost]
            public async Task<ActionResult<DailyTask>> Create(DailyTask task)
            {
                _context.DailyTasks.Add(task);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = task.TaskID }, task);
            }

            // PUT: api/DailyTasks/{id}
            [HttpPut("{id}")]
            public async Task<IActionResult> Update(int id, DailyTask task)
            {
                if (id != task.TaskID)
                    return BadRequest();

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

            // DELETE: api/DailyTasks/{id}
            [HttpDelete("{id}")]
            public async Task<IActionResult> Delete(int id)
            {
                var task = await _context.DailyTasks.FindAsync(id);
                if (task == null)
                    return NotFound();

                _context.DailyTasks.Remove(task);
                await _context.SaveChangesAsync();
                return NoContent();
            }
        }
    }



