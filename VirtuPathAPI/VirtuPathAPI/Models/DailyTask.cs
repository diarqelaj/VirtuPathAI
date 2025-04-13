using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtuPathAPI.Models
{
    [Table("DailyTasks")]
    public class DailyTask
    {
        [Key]
        public int TaskID { get; set; }

        public int CareerPathID { get; set; }

        [Required]
        public string TaskDescription { get; set; }

        [Required]
        public int Day { get; set; }
    }
}