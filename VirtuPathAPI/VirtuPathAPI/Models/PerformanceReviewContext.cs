using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Models
{
    public class PerformanceReviewContext : DbContext
    {
        public PerformanceReviewContext(DbContextOptions<PerformanceReviewContext> options) : base(options) { }

        public DbSet<PerformanceReview> PerformanceReviews { get; set; }
    }
}
