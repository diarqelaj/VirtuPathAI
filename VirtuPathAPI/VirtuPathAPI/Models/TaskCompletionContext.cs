using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Models
{
    public class TaskCompletionContext : DbContext
    {
        public TaskCompletionContext(DbContextOptions<TaskCompletionContext> options)
            : base(options)
        {
        }

        public DbSet<TaskCompletion> TaskCompletions { get; set; }
        public DbSet<UserSubscription> UserSubscriptions { get; set; }
        public DbSet<DailyTask> DailyTasks { get; set; }
        public DbSet<PerformanceReview> PerformanceReviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // TaskCompletion
            modelBuilder.Entity<TaskCompletion>(entity =>
            {
                entity.ToTable("TaskCompletion");
                entity.HasKey(tc => tc.CompletionID);
            });

            // UserSubscription
            modelBuilder.Entity<UserSubscription>(entity =>
            {
                entity.ToTable("UserSubscriptions");
                entity.HasKey(us => us.SubscriptionID); // Assuming SubscriptionID is the PK
            });

            // DailyTask
            modelBuilder.Entity<DailyTask>(entity =>
            {
                entity.ToTable("DailyTasks");
                entity.HasKey(dt => dt.TaskID);
            });

            // PerformanceReview
            modelBuilder.Entity<PerformanceReview>(entity =>
            {
                entity.ToTable("PerformanceReviews");
                entity.HasKey(pr => pr.ReviewID);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
