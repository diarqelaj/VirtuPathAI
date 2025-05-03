using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtuPathAPI.Models
{
    [Table("BugReports")]
    public class BugReport
    {
        [Key]
        public int ReportID { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Description { get; set; }

        public string? ScreenshotPath { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // ✅ NEW: Store the IP address
        public string IPAddress { get; set; }
    }
}
