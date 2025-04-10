using System;
using System.ComponentModel.DataAnnotations;

namespace VirtuPathAPI.Models
{
    public class UserSubscription
    {
        [Key] // 👈 Add this
        public int SubscriptionID { get; set; }

        public int UserID { get; set; }
        public int CareerPathID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int LastAccessedDay { get; set; }
    }
}