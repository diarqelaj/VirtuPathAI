using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VirtuPathAPI.Models
{

    [Table("TaskCompletion")]
    public class TaskCompletion
    {
        [Key]
        public int CompletionID { get; set; }  // Mark this as the primary key
        public int UserID { get; set; }
        public int TaskID { get; set; }
        public DateTime CompletionDate { get; set; }
    }
}