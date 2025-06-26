using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Dtos;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Register new user",
        Description = "Creates a new user account with phone number and password.",
        OperationId = "Register"
    )]
    [SwaggerResponse(200, "User registered successfully", typeof(AuthResponseDto))]
    [SwaggerResponse(400, "Bad request - User already exists", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        try
        {
            var result = await _authService.RegisterAsync(registerDto);
            
            if (result == null)
            {
                return BadRequest(new { message = "User with this phone number already exists" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "User login",
        Description = "Authenticates user with phone number and password, returns JWT token.",
        OperationId = "Login"
    )]
    [SwaggerResponse(200, "Login successful", typeof(AuthResponseDto))]
    [SwaggerResponse(401, "Unauthorized - Invalid credentials", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);
            
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid phone number or password" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
        }
    }

    [HttpPost("admin/login")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Admin login",
        Description = "Authenticates admin user with phone number and password. Returns JWT token only if user has Admin role.",
        OperationId = "AdminLogin"
    )]
    [SwaggerResponse(200, "Admin login successful", typeof(AuthResponseDto))]
    [SwaggerResponse(401, "Unauthorized - Invalid credentials or insufficient permissions", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<AuthResponseDto>> AdminLogin(LoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);
            
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid phone number or password" });
            }

            // Check if user has Admin role
            if (!result.User.Roles.Contains("Admin"))
            {
                return Unauthorized(new { message = "Admin privileges required" });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during admin login", error = ex.Message });
        }
    }

    [HttpGet("profile")]
    [RequireAuth]
    [SwaggerOperation(
        Summary = "Get user profile",
        Description = "Retrieves the profile information of the currently authenticated user. Requires valid JWT token.",
        OperationId = "GetProfile"
    )]
    [SwaggerResponse(200, "User profile retrieved successfully", typeof(UserDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
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
            return StatusCode(500, new { message = "An error occurred while fetching profile", error = ex.Message });
        }

    }
} 