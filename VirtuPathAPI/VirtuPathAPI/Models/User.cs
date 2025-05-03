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

    // ✅ New properties for 2FA
    public bool IsTwoFactorEnabled { get; set; } = false;
    public string? TwoFactorCode { get; set; }
    public DateTime? TwoFactorCodeExpiresAt { get; set; }

    // ✅ New property for profile picture (store image filename or URL)
    public string? ProfilePictureUrl { get; set; }
}

}
