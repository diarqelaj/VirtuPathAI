using System;

namespace VirtuPathAPI.Models
{
    public class TaskCompletion
    {
        public int CompletionID { get; set; }
        public int UserID { get; set; }
        public int TaskID { get; set; }
        public DateTime CompletionDate { get; set; }
    }
}
