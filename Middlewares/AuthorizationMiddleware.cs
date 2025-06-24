using Toxos_V2.Models;
using System.Text.Json;

namespace Toxos_V2.Middlewares;

public class AuthorizationMiddleware
{
    private readonly RequestDelegate _next;

    public AuthorizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip authorization for certain paths
        if (ShouldSkipAuthorization(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Check if user is authenticated
        var user = context.Items["User"] as User;
        if (user == null)
        {
            await HandleUnauthorized(context, "Authentication required");
            return;
        }

        // Check role-based authorization
        var requiredRole = GetRequiredRole(context.Request.Path);
        if (!string.IsNullOrEmpty(requiredRole) && !HasRequiredRole(user, requiredRole))
        {
            await HandleForbidden(context, $"Access denied. Required role: {requiredRole}");
            return;
        }

        await _next(context);
    }

    private static bool ShouldSkipAuthorization(PathString path)
    {
        var publicPaths = new[]
        {
            "/api/auth/register",
            "/api/auth/login", 
            "/api/category",
            "/hello",
            "/test-db",
            "/swagger",
            "/api-docs"
        };

        return publicPaths.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
    }

    private static string? GetRequiredRole(PathString path)
    {
        // Define role requirements for different paths
        var roleRequirements = new Dictionary<string, string>
        {
            { "/admin", "Admin" },
            { "/products/create", "Admin" },
            { "/products/update", "Admin" },
            { "/products/delete", "Admin" },
            { "/users/all", "Admin" },
            { "/orders/all", "Admin" }
        };

        foreach (var requirement in roleRequirements)
        {
            if (path.StartsWithSegments(requirement.Key, StringComparison.OrdinalIgnoreCase))
            {
                return requirement.Value;
            }
        }

        // Default: any authenticated user can access
        return null;
    }

    private static bool HasRequiredRole(User user, string requiredRole)
    {
        return user.Roles.Contains(requiredRole, StringComparer.OrdinalIgnoreCase);
    }

    private static async Task HandleUnauthorized(HttpContext context, string message)
    {
        context.Response.StatusCode = 401;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = "Unauthorized",
            message = message,
            statusCode = 401
        };

        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }

    private static async Task HandleForbidden(HttpContext context, string message)
    {
        context.Response.StatusCode = 403;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = "Forbidden",
            message = message,
            statusCode = 403
        };

        var json = JsonSerializer.Serialize(response);
        await context.Response.WriteAsync(json);
    }
} 