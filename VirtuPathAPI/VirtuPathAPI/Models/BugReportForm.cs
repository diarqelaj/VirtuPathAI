using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace VirtuPathAPI.Models
{
    public class BugReportForm
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Description { get; set; }

        public IFormFile? Screenshot { get; set; }
    }
}
