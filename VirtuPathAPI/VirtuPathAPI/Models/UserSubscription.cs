using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtuPathAPI.Models
{
    public class UserSubscription
    {
        [Key] // 👈 Primary key attribute
        public int SubscriptionID { get; set; }

        public int UserID { get; set; }
        public int CareerPathID { get; set; }
        public DateTime StartDate { get; set; }

        // Mark EndDate as a computed column
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime EndDate { get; set; }

        public int LastAccessedDay { get; set; }
    }
}
