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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map the TaskCompletion entity to the actual table name in your database
            modelBuilder.Entity<TaskCompletion>(entity =>
            {
                entity.ToTable("TaskCompletion");      // <-- your existing table name
                entity.HasKey(tc => tc.CompletionID);  // <-- define CompletionID as the PK
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
