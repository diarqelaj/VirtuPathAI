using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;

namespace VirtuPathAPI.Models
{
    public class TaskCompletionContext : DbContext
    {
        public TaskCompletionContext(DbContextOptions<TaskCompletionContext> options) : base(options) { }

        public DbSet<TaskCompletion> TaskCompletions { get; set; }
    }
}
