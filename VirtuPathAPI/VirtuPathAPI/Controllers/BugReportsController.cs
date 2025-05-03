using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BugReportsController : ControllerBase
    {
        private readonly BugReportContext _context;

        public BugReportsController(BugReportContext context)
        {
            _context = context;
        }

        // GET: api/bugreports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BugReport>>> GetAllReports()
        {
            return await _context.BugReports.OrderByDescending(b => b.SubmittedAt).ToListAsync();
        }

        // GET: api/bugreports/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BugReport>> GetReport(int id)
        {
            var report = await _context.BugReports.FindAsync(id);
            if (report == null)
                return NotFound();

            return report;
        }

        // POST: api/bugreports
        [HttpPost]
        public async Task<ActionResult<BugReport>> SubmitReport([FromForm] BugReportForm form)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var now = DateTime.UtcNow;
            var todayStart = now.Date;

            var recentCount = await _context.BugReports
                .Where(b => b.IPAddress == ipAddress && b.SubmittedAt >= todayStart)
                .CountAsync();

            if (recentCount >= 2)
            {
                return BadRequest(new { error = "Maximum limit exceeded. Please try again later." });
            }

            string? screenshotPath = null;
            if (form.Screenshot != null)
            {
                var uploadsDir = Path.Combine("wwwroot", "uploads", "screenshots");
                Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}_{form.Screenshot.FileName}";
                var fullPath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await form.Screenshot.CopyToAsync(stream);
                }

                screenshotPath = $"/uploads/screenshots/{fileName}";
            }

            var report = new BugReport
            {
                FullName = form.FullName,
                Email = form.Email,
                Description = form.Description,
                ScreenshotPath = screenshotPath,
                SubmittedAt = now,
                IPAddress = ipAddress
            };

            _context.BugReports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReport), new { id = report.ReportID }, report);
        }



        // DELETE: api/bugreports/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = await _context.BugReports.FindAsync(id);
            if (report == null)
                return NotFound();

            _context.BugReports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
