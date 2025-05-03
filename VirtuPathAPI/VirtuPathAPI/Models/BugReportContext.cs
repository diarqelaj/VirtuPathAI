using Microsoft.EntityFrameworkCore;

namespace VirtuPathAPI.Models
{
    public class BugReportContext : DbContext
    {
        public BugReportContext(DbContextOptions<BugReportContext> options)
            : base(options)
        {
        }

        public DbSet<BugReport> BugReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BugReport>(entity =>
            {
                entity.ToTable("BugReports");
                entity.HasKey(br => br.ReportID);
                entity.Property(br => br.FullName).IsRequired();
                entity.Property(br => br.Email).IsRequired();
                entity.Property(br => br.Description).IsRequired();
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
