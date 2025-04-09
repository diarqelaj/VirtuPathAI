using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PerformanceReviewsController : ControllerBase
    {
        private readonly PerformanceReviewContext _context;

        public PerformanceReviewsController(PerformanceReviewContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PerformanceReview>>> GetPerformanceReviews()
        {
            return await _context.PerformanceReviews.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerformanceReview>> GetPerformanceReview(int id)
        {
            var review = await _context.PerformanceReviews.FindAsync(id);
            if (review == null)
                return NotFound();

            return review;
        }

        [HttpPost]
        public async Task<ActionResult<PerformanceReview>> CreatePerformanceReview(PerformanceReview review)
        {
            _context.PerformanceReviews.Add(review);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPerformanceReview), new { id = review.ReviewID }, review);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePerformanceReview(int id, PerformanceReview review)
        {
            if (id != review.ReviewID)
                return BadRequest();

            _context.Entry(review).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerformanceReview(int id)
        {
            var review = await _context.PerformanceReviews.FindAsync(id);
            if (review == null)
                return NotFound();

            _context.PerformanceReviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
