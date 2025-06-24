using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Toxos_V2.Services;

namespace Toxos_V2.Middlewares;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _configuration;

    public JwtMiddleware(RequestDelegate next, IConfiguration configuration)
    {
        _next = next;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context, AuthService authService)
    {
        var token = ExtractTokenFromRequest(context);

        if (!string.IsNullOrEmpty(token))
        {
            await AttachUserToContext(context, authService, token);
        }

        await _next(context);
    }

    private string? ExtractTokenFromRequest(HttpContext context)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        
        if (!string.IsNullOrEmpty(authHeader))
        {
            // Handle Bearer token format
            if (authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }
            
            // Handle raw token format (without Bearer prefix)
            // Check if it looks like a JWT token (has 2 dots)
            if (authHeader.Split('.').Length == 3)
            {
                return authHeader.Trim();
            }
        }

        return null;
    }

    private async Task AttachUserToContext(HttpContext context, AuthService authService, string token)
    {
        try
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
            
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
            
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                var user = await authService.GetUserByIdAsync(userId);
                if (user != null)
                {
                    context.Items["User"] = user;
                    context.Items["UserId"] = userId;
                    context.Items["UserRoles"] = user.Roles;
                }
            }
        }
        catch (Exception)
        {
            // Token validation failed - user remains unauthenticated
            // Don't throw exception, just continue without user context
        }
    }
} 