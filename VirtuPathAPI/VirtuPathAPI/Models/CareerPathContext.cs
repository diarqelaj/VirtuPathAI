using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Models
{
    public class CareerPathContext : DbContext
    {
        public CareerPathContext(DbContextOptions<CareerPathContext> options) : base(options) { }

        public DbSet<CareerPath> CareerPaths { get; set; }
    }
}
