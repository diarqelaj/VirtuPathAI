using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtuPathAPI.Models
{
    [Table("TaskCompletion")]
    public class TaskCompletion
    {
        [Key]
        public int CompletionID { get; set; }  // Primary key

        public int UserID { get; set; }

        public int TaskID { get; set; }

        public DateTime CompletionDate { get; set; }

        // ✅ NEW: To track which logical "day" of the career path this belongs to
        public int CareerDay { get; set; }

        // Optional: Navigation properties if needed
        [ForeignKey("UserID")]
        public User? User { get; set; }

        [ForeignKey("TaskID")]
        public DailyTask? Task { get; set; }
    }
}
