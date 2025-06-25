using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Toxos_V2.Models;
using Toxos_V2.Dtos;
using BCrypt.Net;

namespace Toxos_V2.Services;

public class AuthService
{
    private readonly IMongoCollection<User> _users;
    private readonly IConfiguration _configuration;

    public AuthService(MongoDBService mongoDBService, IConfiguration configuration)
    {
        _users = mongoDBService.GetCollection<User>("users");
        _configuration = configuration;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto registerDto)
    {
        // Check if user already exists
        var existingUser = await _users.Find(x => x.Phone == registerDto.Phone).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            return null; // User already exists
        }

        // Create new user
        var user = new User
        {
            Phone = registerDto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FullName = "", // Default empty value since not provided in registration
            Roles = new List<string> { "User" } // Default role
        };

        await _users.InsertOneAsync(user);

        // Generate JWT token
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user),
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        // Find user by phone
        var user = await _users.Find(x => x.Phone == loginDto.Phone).FirstOrDefaultAsync();
        if (user == null)
        {
            return null; // User not found
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null; // Invalid password
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddDays(7);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user),
            ExpiresAt = expiresAt
        };
    }

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        return await _users.Find(x => x.Id == userId).FirstOrDefaultAsync();
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "ToxosAPI";
        var audience = jwtSettings["Audience"] ?? "ToxosAPI";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id!),
            new(ClaimTypes.Name, user.Phone),
            new(ClaimTypes.MobilePhone, user.Phone)
        };

        // Add role claims
        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id!,
            Phone = user.Phone,
            FullName = user.FullName,
            Gender = user.Gender,
            Address = user.Address,
            Point = user.Point,
            Roles = user.Roles
        };
    }
} 