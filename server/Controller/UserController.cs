using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using Toxos_V2.Dtos;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
[SwaggerTag("User management - User profiles and admin user management")]
public class UserController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;

    public UserController(AuthService authService, UserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    // User endpoints
    [HttpGet("profile")]
    [RequireAuth]
    [SwaggerOperation(Summary = "Get user profile", Description = "Get current user's profile information")]
    [SwaggerResponse(200, "Profile retrieved successfully", typeof(UserDto))]
    [SwaggerResponse(401, "User not authenticated")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        try
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

            return Ok(userDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving profile", error = ex.Message });
        }
    }

    [HttpGet("dashboard")]
    [RequireUser]
    [SwaggerOperation(Summary = "Get user dashboard", Description = "Get user dashboard information")]
    [SwaggerResponse(200, "Dashboard retrieved successfully")]
    [SwaggerResponse(401, "User not authenticated")]
    public async Task<IActionResult> GetUserDashboard()
    {
        try
        {
            var currentUser = HttpContext.GetCurrentUser();
            return Ok(new 
            { 
                message = "Welcome to your dashboard",
                user = new {
                    name = currentUser?.FullName,
                    phone = currentUser?.Phone,
                    points = currentUser?.Point
                },
                isAdmin = HttpContext.IsAdmin()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard", error = ex.Message });
        }
    }

    // Admin endpoints
    [HttpGet("admin/all")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get all users (Admin)", Description = "Get paginated list of all users with filtering options")]
    [SwaggerResponse(200, "Users retrieved successfully", typeof(PaginatedResponse<AdminUserDto>))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    public async Task<ActionResult<PaginatedResponse<AdminUserDto>>> GetAllUsersForAdmin([FromQuery] UserFilterDto request)
    {
        try
        {
            var result = await _userService.GetUsersForAdminAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
        }
    }

    [HttpGet("admin/{id}")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get user by ID (Admin)", Description = "Get detailed user information by ID")]
    [SwaggerResponse(200, "User found", typeof(AdminUserDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<ActionResult<AdminUserDto>> GetUserByIdForAdmin(string id)
    {
        try
        {
            var user = await _userService.GetUserByIdForAdminAsync(id);
            
            if (user == null)
                return NotFound(new { message = "User not found" });
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving user", error = ex.Message });
        }
    }

    [HttpPost("admin/create")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Create new user (Admin)", Description = "Create a new user with specified roles and information")]
    [SwaggerResponse(201, "User created successfully", typeof(AdminUserDto))]
    [SwaggerResponse(400, "Bad request - Invalid data or user already exists")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    public async Task<ActionResult<AdminUserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            var result = await _userService.CreateUserAsync(createUserDto);
            return CreatedAtAction(nameof(GetUserByIdForAdmin), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating user", error = ex.Message });
        }
    }

    [HttpPut("admin/{id}")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Update user (Admin)", Description = "Update user information")]
    [SwaggerResponse(200, "User updated successfully", typeof(AdminUserDto))]
    [SwaggerResponse(400, "Bad request - Invalid data")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<ActionResult<AdminUserDto>> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
    {
        try
        {
            var result = await _userService.UpdateUserAsync(id, updateUserDto);
            
            if (result == null)
                return NotFound(new { message = "User not found" });
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating user", error = ex.Message });
        }
    }

    [HttpPut("admin/{id}/roles")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Update user roles (Admin)", Description = "Update user roles and permissions")]
    [SwaggerResponse(200, "User roles updated successfully", typeof(AdminUserDto))]
    [SwaggerResponse(400, "Bad request - Invalid roles")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<ActionResult<AdminUserDto>> UpdateUserRoles(string id, [FromBody] UpdateUserRolesDto updateRolesDto)
    {
        try
        {
            var result = await _userService.UpdateUserRolesAsync(id, updateRolesDto);
            
            if (result == null)
                return NotFound(new { message = "User not found" });
            
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating user roles", error = ex.Message });
        }
    }

    [HttpPost("admin/{id}/promote")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Promote user to admin (Admin)", Description = "Add Admin role to existing user")]
    [SwaggerResponse(200, "User promoted successfully", typeof(AdminUserDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<ActionResult<AdminUserDto>> PromoteToAdmin(string id)
    {
        try
        {
            var user = await _userService.GetUserByIdForAdminAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Roles.Contains("Admin"))
                return BadRequest(new { message = "User is already an admin" });

            var newRoles = user.Roles.ToList();
            if (!newRoles.Contains("Admin"))
                newRoles.Add("Admin");

            var updateRolesDto = new UpdateUserRolesDto { Roles = newRoles };
            var result = await _userService.UpdateUserRolesAsync(id, updateRolesDto);
            
            return Ok(new { 
                message = "User promoted to admin successfully",
                user = result,
                promotedBy = HttpContext.GetCurrentUser()?.Phone
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while promoting user", error = ex.Message });
        }
    }

    [HttpPost("admin/{id}/demote")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Demote admin to user (Admin)", Description = "Remove Admin role from user")]
    [SwaggerResponse(200, "User demoted successfully", typeof(AdminUserDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<ActionResult<AdminUserDto>> DemoteFromAdmin(string id)
    {
        try
        {
            var user = await _userService.GetUserByIdForAdminAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (!user.Roles.Contains("Admin"))
                return BadRequest(new { message = "User is not an admin" });

            var newRoles = user.Roles.Where(r => r != "Admin").ToList();
            if (!newRoles.Contains("User"))
                newRoles.Add("User");

            var updateRolesDto = new UpdateUserRolesDto { Roles = newRoles };
            var result = await _userService.UpdateUserRolesAsync(id, updateRolesDto);
            
            return Ok(new { 
                message = "User demoted from admin successfully",
                user = result,
                demotedBy = HttpContext.GetCurrentUser()?.Phone
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while demoting user", error = ex.Message });
        }
    }

    [HttpPut("admin/{id}/password")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Change user password (Admin)", Description = "Change password for any user")]
    [SwaggerResponse(200, "Password changed successfully")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<IActionResult> ChangeUserPassword(string id, [FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var result = await _userService.ChangeUserPasswordAsync(id, changePasswordDto);
            
            if (!result)
                return NotFound(new { message = "User not found" });
            
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while changing password", error = ex.Message });
        }
    }

    [HttpDelete("admin/{id}")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Delete user (Admin)", Description = "Delete user permanently")]
    [SwaggerResponse(200, "User deleted successfully")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "User not found")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var currentUserId = HttpContext.GetCurrentUserId();
            if (id == currentUserId)
            {
                return BadRequest(new { message = "Cannot delete your own account" });
            }

            var result = await _userService.DeleteUserAsync(id);
            
            if (!result)
                return NotFound(new { message = "User not found" });
            
            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting user", error = ex.Message });
        }
    }

    [HttpGet("admin/stats")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get user statistics (Admin)", Description = "Get comprehensive user statistics")]
    [SwaggerResponse(200, "Statistics retrieved successfully", typeof(UserStatsDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats()
    {
        try
        {
            var stats = await _userService.GetUserStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving statistics", error = ex.Message });
        }
    }

    [HttpGet("admin/roles")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get available roles (Admin)", Description = "Get list of all available user roles")]
    [SwaggerResponse(200, "Roles retrieved successfully")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    public async Task<IActionResult> GetAvailableRoles()
    {
        try
        {
            var roles = new[] { "User", "Admin" };
            return Ok(new { 
                roles = roles,
                descriptions = new {
                    User = "Regular user with basic permissions",
                    Admin = "Administrator with full system access"
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving roles", error = ex.Message });
        }
    }
} 