using System.ComponentModel.DataAnnotations;

namespace Toxos_V2.Dtos;

public class RegisterDto
{
    [Required]
    [Phone]
    public required string Phone { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

}

public class LoginDto
{
    [Required]
    [Phone]
    public required string Phone { get; set; }

    [Required]
    public required string Password { get; set; }
}

public class AuthResponseDto
{
    public required string Token { get; set; }
    public required UserDto User { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class UserDto
{
    public required string Id { get; set; }
    public required string Phone { get; set; }
    public required string FullName { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public int Point { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
}

// Admin DTOs for user management
public class CreateUserDto
{
    [Required]
    [Phone]
    public required string Phone { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string FullName { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [Range(0, int.MaxValue)]
    public int Point { get; set; } = 0;

    public List<string> Roles { get; set; } = new List<string> { "User" };
}

public class UpdateUserDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string FullName { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [Range(0, int.MaxValue)]
    public int Point { get; set; }
}

public class AdminUserDto
{
    public required string Id { get; set; }
    public required string Phone { get; set; }
    public required string FullName { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public int Point { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateUserRolesDto
{
    [Required]
    public required List<string> Roles { get; set; }
}

public class ChangePasswordDto
{
    [Required]
    [MinLength(6)]
    public required string NewPassword { get; set; }
}

public class UserFilterDto : PaginationRequest
{
    public string? Role { get; set; }
    public string? Gender { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
} 