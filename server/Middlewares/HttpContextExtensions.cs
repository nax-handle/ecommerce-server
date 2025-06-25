using Toxos_V2.Models;

namespace Toxos_V2.Middlewares;

public static class HttpContextExtensions
{
    public static User? GetCurrentUser(this HttpContext context)
    {
        return context.Items["User"] as User;
    }

    public static string? GetCurrentUserId(this HttpContext context)
    {
        return context.Items["UserId"] as string;
    }

    public static List<string> GetCurrentUserRoles(this HttpContext context)
    {
        return context.Items["UserRoles"] as List<string> ?? new List<string>();
    }

    public static bool IsAuthenticated(this HttpContext context)
    {
        return context.GetCurrentUser() != null;
    }

    public static bool HasRole(this HttpContext context, string role)
    {
        var userRoles = context.GetCurrentUserRoles();
        return userRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }

    public static bool IsAdmin(this HttpContext context)
    {
        return context.HasRole("Admin");
    }

    public static bool IsUser(this HttpContext context)
    {
        return context.HasRole("User") || context.HasRole("Admin");
    }
} 