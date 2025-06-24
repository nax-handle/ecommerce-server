using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Toxos_V2.Models;

namespace Toxos_V2.Middlewares;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireAuthAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _roles;

    public RequireAuthAttribute(params string[] roles)
    {
        _roles = roles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // Skip authorization if action has [AllowAnonymous]
        if (context.ActionDescriptor.EndpointMetadata.OfType<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>().Any())
        {
            return;
        }

        var user = context.HttpContext.Items["User"] as User;
        
        if (user == null)
        {
            // User is not authenticated
            context.Result = new JsonResult(new
            {
                error = "Unauthorized",
                message = "Authentication required",
                statusCode = 401
            })
            {
                StatusCode = 401
            };
            return;
        }

        // Check role requirements
        if (_roles.Length > 0 && !_roles.Any(role => user.Roles.Contains(role, StringComparer.OrdinalIgnoreCase)))
        {
            // User doesn't have required role
            context.Result = new JsonResult(new
            {
                error = "Forbidden",
                message = $"Access denied. Required roles: {string.Join(", ", _roles)}",
                statusCode = 403
            })
            {
                StatusCode = 403
            };
            return;
        }
    }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireAdminAttribute : RequireAuthAttribute
{
    public RequireAdminAttribute() : base("Admin") { }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireUserAttribute : RequireAuthAttribute
{
    public RequireUserAttribute() : base("User", "Admin") { }
} 