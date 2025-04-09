using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CareerPathsController : ControllerBase
    {
        private readonly CareerPathContext _context;

        public CareerPathsController(CareerPathContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CareerPath>>> GetCareerPaths()
        {
            return await _context.CareerPaths.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CareerPath>> GetCareerPath(int id)
        {
            var path = await _context.CareerPaths.FindAsync(id);
            if (path == null)
                return NotFound();

            return path;
        }

        [HttpPost]
        public async Task<ActionResult<CareerPath>> CreateCareerPath(CareerPath path)
        {
            _context.CareerPaths.Add(path);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCareerPath), new { id = path.CareerPathID }, path);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCareerPath(int id, CareerPath path)
        {
            if (id != path.CareerPathID)
                return BadRequest();

            _context.Entry(path).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCareerPath(int id)
        {
            var path = await _context.CareerPaths.FindAsync(id);
            if (path == null)
                return NotFound();

            _context.CareerPaths.Remove(path);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
