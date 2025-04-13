using System.ComponentModel.DataAnnotations;

namespace VirtuPathAPI.Models
{

    public class PerformanceReview
    {
        [Key]
        public int ReviewID { get; set; }
        public int UserID { get; set; }
        public int CareerPathID { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public int TasksCompleted { get; set; }
        public int TasksAssigned { get; set; }
        public int PerformanceScore { get; set; }
    }
}