using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Models
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions<UserContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}
