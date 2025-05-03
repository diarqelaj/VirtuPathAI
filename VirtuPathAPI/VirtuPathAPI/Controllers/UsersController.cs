using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirtuPathAPI.Models;
using BCrypt.Net;
using System.Text.RegularExpressions;


namespace VirtuPathAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserContext _context;

        public UsersController(UserContext context)
        {
            _context = context;
        }

        // ✅ GET all users (admin/debug only)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // ✅ GET user by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }
        
        // ✅ POST /api/users — Register new user with hashed password
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            // Hash the password before saving
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserID }, user);
        }

        // ✅ PUT /api/users/{id} — Update existing user
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.UserID) return BadRequest();

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file, [FromForm] int userId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            // Ensure the folder exists
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profile-pictures");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generate unique file name
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file to server
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Set relative URL to serve from frontend
            var imageUrl = $"/profile-pictures/{fileName}";
            user.ProfilePictureUrl = imageUrl;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { profilePictureUrl = imageUrl });
        }
        [HttpDelete("delete-profile-picture")]
        public async Task<IActionResult> DeleteProfilePicture([FromQuery] int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found.");

            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfilePictureUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                user.ProfilePictureUrl = null;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Profile picture deleted." });
        }



        // ✅ DELETE user
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpPatch("2fa")]
        public async Task<IActionResult> SetTwoFactorCode([FromBody] TwoFactorRequest req)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return NotFound();

            user.TwoFactorCode = req.Code;
            user.TwoFactorCodeExpiresAt = req.ExpiresAt;

            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        public class TwoFactorRequest
        {
            public string Email { get; set; }
            public string Code { get; set; }
            public DateTime ExpiresAt { get; set; }
        }

        // ✅ POST /api/users/login — Login with password verification
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Unauthorized();

            // Compare input password with hashed password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
            if (!isPasswordValid) return Unauthorized();

            // Start 1-minute session
            HttpContext.Session.SetInt32("UserID", user.UserID);

            // If remember-me → set long-lived cookie
            if (req.RememberMe)
            {
                Response.Cookies.Append(
                    "VirtuPathRemember",
                    user.UserID.ToString(),
                    new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Lax,
                        Expires = DateTimeOffset.UtcNow.AddMonths(1)
                    });
            }

            return Ok(new { userID = user.UserID });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            Response.Cookies.Delete("VirtuPathRemember");
            return Ok();
        }

        // ✅ GET /api/users/me — Get current session user
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = HttpContext.Session.GetInt32("UserID");
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            return Ok(user);
        }
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            var userId = HttpContext.Session.GetInt32("UserID");
            if (userId == null)
                return Unauthorized(new { error = "User not logged in" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized(new { error = "User not found" });

            // Verify old password
            if (!BCrypt.Net.BCrypt.Verify(req.OldPassword, user.PasswordHash))
                return BadRequest(new { error = "Current password is incorrect" });

            // Validate new password
            if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 8 ||
                !Regex.IsMatch(req.NewPassword, @"[A-Z]") ||
                !Regex.IsMatch(req.NewPassword, @"[0-9]") ||
                !Regex.IsMatch(req.NewPassword, @"[!@#$%^&*()_+{}\[\]:;'"",.<>/?\\|`~\-]"))
            {
                return BadRequest(new { error = "Password must be 8+ characters with uppercase, number, and symbol" });
            }

            // Save new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

    }
     

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public bool RememberMe { get; set; }
    }
    public class ChangePasswordRequest
{
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}

}
