using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Models
{
    public class UserSubscriptionContext : DbContext
    {
        public UserSubscriptionContext(DbContextOptions<UserSubscriptionContext> options) : base(options) { }

        public DbSet<UserSubscription> UserSubscriptions { get; set; }
    }
}
