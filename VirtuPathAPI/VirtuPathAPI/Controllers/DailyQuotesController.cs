using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DailyQuotesController : ControllerBase
    {
        private readonly DailyQuoteContext _context;

        public DailyQuotesController(DailyQuoteContext context)
        {
            _context = context;
        }

        // GET: api/DailyQuotes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DailyQuote>>> GetAll()
        {
            return await _context.DailyQuotes.ToListAsync();
        }

        // GET: api/DailyQuotes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DailyQuote>> GetById(int id)
        {
            var quote = await _context.DailyQuotes.FindAsync(id);
            if (quote == null)
                return NotFound();

            return quote;
        }

        // POST: api/DailyQuotes
        [HttpPost]
        public async Task<ActionResult<DailyQuote>> Create(DailyQuote quote)
        {
            _context.DailyQuotes.Add(quote);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = quote.QuoteID }, quote);
        }

        // PUT: api/DailyQuotes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, DailyQuote quote)
        {
            if (id != quote.QuoteID)
                return BadRequest();

            _context.Entry(quote).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.DailyQuotes.Any(e => e.QuoteID == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/DailyQuotes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var quote = await _context.DailyQuotes.FindAsync(id);
            if (quote == null)
                return NotFound();

            _context.DailyQuotes.Remove(quote);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

