
    using Microsoft.EntityFrameworkCore;
 

    namespace VirtuPathAPI.Models
    {
        public class DailyTaskContext : DbContext
        {
            public DailyTaskContext(DbContextOptions<DailyTaskContext> options) : base(options) { }

            public DbSet<DailyTask> DailyTasks { get; set; }
        }
    }


