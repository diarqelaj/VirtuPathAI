using System;

namespace VirtuPathAPI.Models
{
    public class User
{
    public int UserID { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public DateTime RegistrationDate { get; set; }

    // 2FA fields
    public bool IsTwoFactorEnabled { get; set; } = false;
    public string? TwoFactorCode { get; set; }
    public DateTime? TwoFactorCodeExpiresAt { get; set; }

    // Profile
    public string? ProfilePictureUrl { get; set; }

    // 🆕 Progress Tracking Fields
    public int? CareerPathID { get; set; }
    public int CurrentDay { get; set; } = 0; // Day user is currently on (0-6)
    public DateTime? LastTaskDate { get; set; } // Date when user last got/completed tasks

    // Optional: track IP if needed
    public string? LastKnownIP { get; set; }

    // Navigation property (optional if you want to load career path info)
    public CareerPath? CareerPath { get; set; }
}


}
