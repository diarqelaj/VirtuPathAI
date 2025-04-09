using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserSubscriptionsController : ControllerBase
    {
        private readonly UserSubscriptionContext _context;

        public UserSubscriptionsController(UserSubscriptionContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserSubscription>>> GetUserSubscriptions()
        {
            return await _context.UserSubscriptions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserSubscription>> GetUserSubscription(int id)
        {
            var subscription = await _context.UserSubscriptions.FindAsync(id);
            if (subscription == null)
                return NotFound();

            return subscription;
        }

        [HttpPost]
        public async Task<ActionResult<UserSubscription>> CreateUserSubscription(UserSubscription subscription)
        {
            _context.UserSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserSubscription), new { id = subscription.SubscriptionID }, subscription);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserSubscription(int id, UserSubscription subscription)
        {
            if (id != subscription.SubscriptionID)
                return BadRequest();

            _context.Entry(subscription).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserSubscription(int id)
        {
            var subscription = await _context.UserSubscriptions.FindAsync(id);
            if (subscription == null)
                return NotFound();

            _context.UserSubscriptions.Remove(subscription);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
