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