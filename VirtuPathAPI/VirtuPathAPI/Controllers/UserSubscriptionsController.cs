using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

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
            // Don't touch EndDate at all since it's a computed column
            _context.UserSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            // ✅ Now also update the User's CareerPathID and progress
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == subscription.UserID);
            if (user != null)
            {
                user.CareerPathID = subscription.CareerPathID;
                user.CurrentDay = 0;
                user.LastTaskDate = null;
                user.LastKnownIP = HttpContext.Connection.RemoteIpAddress?.ToString(); // optional

                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetUserSubscription), new { id = subscription.SubscriptionID }, subscription);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserSubscription(int id, UserSubscription subscription)
        {
            if (id != subscription.SubscriptionID)
                return BadRequest();

            _context.Entry(subscription).State = EntityState.Modified;

            // Don't allow EndDate to be modified
            _context.Entry(subscription).Property(x => x.EndDate).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.UserSubscriptions.Any(e => e.SubscriptionID == id))
                    return NotFound();
                else
                    throw;
            }

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
