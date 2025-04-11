using System.ComponentModel.DataAnnotations;

namespace VirtuPathAPI.Models
{
    public class TaskCompletion
    {
        [Key]
        public int CompletionID { get; set; }  // Mark this as the primary key
        public int UserID { get; set; }
        public int TaskID { get; set; }
        public DateTime CompletionDate { get; set; }
    }
}
