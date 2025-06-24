using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using Toxos_V2.Dtos;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AuthService _authService;

    public UserController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("profile")]
    [RequireAuth] // Requires any authenticated user
    public async Task<IActionResult> GetProfile()
    {
        var currentUser = HttpContext.GetCurrentUser();
        if (currentUser == null)
        {
            return Unauthorized(new { message = "User not found" });
        }

        var userDto = new UserDto
        {
            Id = currentUser.Id!,
            Phone = currentUser.Phone,
            FullName = currentUser.FullName,
            Gender = currentUser.Gender,
            Address = currentUser.Address,
            Point = currentUser.Point,
            Roles = currentUser.Roles
        };

        return Ok(new { user = userDto });
    }

    [HttpGet("all")]
    [RequireAdmin] // Only admin can access
    public async Task<IActionResult> GetAllUsers()
    {
        // This endpoint would typically return all users - placeholder implementation
        return Ok(new 
        { 
            message = "Admin access granted - this would return all users",
            adminUser = HttpContext.GetCurrentUser()?.Phone
        });
    }

    [HttpGet("dashboard")]
    [RequireUser] // Requires User or Admin role
    public async Task<IActionResult> GetUserDashboard()
    {
        var currentUser = HttpContext.GetCurrentUser();
        return Ok(new 
        { 
            message = "Welcome to your dashboard",
            user = currentUser?.Phone,
            isAdmin = HttpContext.IsAdmin()
        });
    }

    [HttpPost("promote/{userId}")]
    [RequireAdmin] // Only admin can promote users
    public async Task<IActionResult> PromoteToAdmin(string userId)
    {
        // This would promote a user to admin - placeholder implementation
        return Ok(new 
        { 
            message = $"User {userId} promoted to admin",
            promotedBy = HttpContext.GetCurrentUser()?.Phone
        });
    }

    [HttpGet("public")]
    [AllowAnonymous] // Anyone can access this
    public IActionResult GetPublicInfo()
    {
        return Ok(new { message = "This is public information, no authentication required" });
    }
} 