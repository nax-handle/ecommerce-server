using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.AspNetCore.Authorization;

namespace Toxos_V2.Middlewares;

public class AuthorizeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check if the action has [AllowAnonymous] attribute
        var hasAllowAnonymous = context.MethodInfo?.GetCustomAttributes(true)
            .Union(context.MethodInfo?.DeclaringType?.GetCustomAttributes(true) ?? Array.Empty<object>())
            .OfType<AllowAnonymousAttribute>()
            .Any() ?? false;

        if (hasAllowAnonymous)
        {
            return; // Skip adding security for anonymous endpoints
        }

        // Check if the action has [RequireAuth], [RequireAdmin], or [RequireUser] attributes
        var hasAuthAttribute = context.MethodInfo?.GetCustomAttributes(true)
            .Union(context.MethodInfo?.DeclaringType?.GetCustomAttributes(true) ?? Array.Empty<object>())
            .Any(attr => attr.GetType().Name.Contains("RequireAuth") || 
                         attr.GetType().Name.Contains("RequireAdmin") || 
                         attr.GetType().Name.Contains("RequireUser")) ?? false;

        if (hasAuthAttribute)
        {
            // Add security requirement for this operation
            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                }
            };

            // Add 401 response if not already present
            if (!operation.Responses.ContainsKey("401"))
            {
                operation.Responses.Add("401", new OpenApiResponse
                {
                    Description = "Unauthorized - Authentication required"
                });
            }
        }
    }
} 