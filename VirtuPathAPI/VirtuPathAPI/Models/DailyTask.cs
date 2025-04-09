
using System.ComponentModel.DataAnnotations;

namespace VirtuPathAPI.Models
{
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

