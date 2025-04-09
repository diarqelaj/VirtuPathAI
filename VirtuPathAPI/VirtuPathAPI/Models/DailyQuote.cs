
    using System.ComponentModel.DataAnnotations;

    namespace VirtuPathAPI.Models
    {
        public class DailyQuote
        {
            [Key]
            public int QuoteID { get; set; }

            [Required]
            public string Quote { get; set; }
        }
    }


