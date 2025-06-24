using Toxos_V2.Models;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB settings
builder.Services.Configure<MongoDBSettings>(
    builder.Configuration.GetSection("MongoDB"));

// Add MongoDB service
builder.Services.AddSingleton<MongoDBService>();

// Add Authentication service
builder.Services.AddScoped<AuthService>();

// Add Category service
builder.Services.AddScoped<CategoryService>();

// Add Product service
builder.Services.AddScoped<ProductService>();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                System.Text.Encoding.ASCII.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Toxos API", 
        Version = "v1",
        Description = "E-Commerce API with JWT Authentication"
    });
    
    c.EnableAnnotations();
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    // Add operation filter to selectively apply authentication
    c.OperationFilter<Toxos_V2.Middlewares.AuthorizeOperationFilter>();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// Add custom JWT middleware for user context
app.UseMiddleware<JwtMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// Note: Using attribute-based authorization instead of global middleware
// Routes with [AllowAnonymous] will be public, routes with [RequireAuth] will require authentication

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/hello", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new Hello
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("Hello");

// MongoDB Connection Test Endpoint
app.MapGet("/test-db", async (MongoDBService mongoDBService) =>
{
    try
    {
        // Try to ping the database
        var pingCommand = new MongoDB.Bson.BsonDocument("ping", 1);
        await mongoDBService.Database.RunCommandAsync<MongoDB.Bson.BsonDocument>(pingCommand);
        
        // Get database stats
        var statsCommand = new MongoDB.Bson.BsonDocument("dbStats", 1);
        var stats = await mongoDBService.Database.RunCommandAsync<MongoDB.Bson.BsonDocument>(statsCommand);
        
        return Results.Ok(new
        {
            status = "Connected",
            database = mongoDBService.Database.DatabaseNamespace.DatabaseName,
            message = "MongoDB connection is working!",
            stats = new
            {
                database = stats.GetValue("db", "").AsString,
                collections = stats.GetValue("collections", 0).AsInt32,
                dataSize = stats.GetValue("dataSize", 0).AsInt64,
                storageSize = stats.GetValue("storageSize", 0).AsInt64
            }
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new
        {
            status = "Failed",
            message = "MongoDB connection failed",
            error = ex.Message
        }, statusCode: 500);
    }
})
.WithName("TestDatabase");

app.Run();

record Hello(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
