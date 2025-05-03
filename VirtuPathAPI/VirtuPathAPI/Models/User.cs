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
        public string? TwoFactorCode { get; set; } // Temporary code (e.g., 6-digit)
        public DateTime? TwoFactorCodeExpiresAt { get; set; } // Expiration
    }
}
