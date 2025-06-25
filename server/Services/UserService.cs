using MongoDB.Driver;
using Toxos_V2.Models;
using Toxos_V2.Dtos;
using BCrypt.Net;

namespace Toxos_V2.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(MongoDBService mongoDBService)
    {
        _users = mongoDBService.GetCollection<User>("users");
    }

    // Admin: Get all users with pagination and filtering
    public async Task<PaginatedResponse<AdminUserDto>> GetUsersForAdminAsync(UserFilterDto request)
    {
        var filter = BuildUserFilter(request);
        var sortDefinition = BuildSortDefinition(request);

        var totalCount = await _users.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var users = await _users
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var userDtos = users.Select(MapToAdminUserDto).ToList();

        return new PaginatedResponse<AdminUserDto>
        {
            Data = userDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    // Admin: Get user by ID
    public async Task<AdminUserDto?> GetUserByIdForAdminAsync(string id)
    {
        var user = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        return user != null ? MapToAdminUserDto(user) : null;
    }

    // Admin: Create new user
    public async Task<AdminUserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        // Check if user already exists
        var existingUser = await _users.Find(x => x.Phone == createUserDto.Phone).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            throw new ArgumentException("User with this phone number already exists");
        }

        // Validate roles
        var validRoles = new[] { "User", "Admin" };
        if (createUserDto.Roles.Any(role => !validRoles.Contains(role)))
        {
            throw new ArgumentException("Invalid role specified");
        }
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);
        var user = new User
        {
            Phone = createUserDto.Phone,
            PasswordHash = passwordHash,
            FullName = createUserDto.FullName,
            Gender = createUserDto.Gender,
            Address = createUserDto.Address,
            Point = createUserDto.Point,
            Roles = createUserDto.Roles,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _users.InsertOneAsync(user);
        return MapToAdminUserDto(user);
    }

    // Admin: Update user information
    public async Task<AdminUserDto?> UpdateUserAsync(string id, UpdateUserDto updateUserDto)
    {
        var existingUser = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existingUser == null)
        {
            return null;
        }

        var updateDefinition = Builders<User>.Update
            .Set(x => x.FullName, updateUserDto.FullName)
            .Set(x => x.Gender, updateUserDto.Gender)
            .Set(x => x.Address, updateUserDto.Address)
            .Set(x => x.Point, updateUserDto.Point)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        await _users.UpdateOneAsync(x => x.Id == id, updateDefinition);

        var updatedUser = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        return MapToAdminUserDto(updatedUser!);
    }

    // Admin: Update user roles
    public async Task<AdminUserDto?> UpdateUserRolesAsync(string id, UpdateUserRolesDto updateRolesDto)
    {
        var existingUser = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existingUser == null)
        {
            return null;
        }

        // Validate roles
        var validRoles = new[] { "User", "Admin" };
        if (updateRolesDto.Roles.Any(role => !validRoles.Contains(role)))
        {
            throw new ArgumentException("Invalid role specified");
        }

        var updateDefinition = Builders<User>.Update
            .Set(x => x.Roles, updateRolesDto.Roles)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        await _users.UpdateOneAsync(x => x.Id == id, updateDefinition);

        var updatedUser = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        return MapToAdminUserDto(updatedUser!);
    }

    // Admin: Change user password
    public async Task<bool> ChangeUserPasswordAsync(string id, ChangePasswordDto changePasswordDto)
    {
        var existingUser = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existingUser == null)
        {
            return false;
        }

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        var updateDefinition = Builders<User>.Update
            .Set(x => x.PasswordHash, passwordHash)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _users.UpdateOneAsync(x => x.Id == id, updateDefinition);
        return result.ModifiedCount > 0;
    }

    // Admin: Delete user
    public async Task<bool> DeleteUserAsync(string id)
    {
        var result = await _users.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    // Check if user exists
    public async Task<bool> UserExistsAsync(string id)
    {
        return await _users.Find(x => x.Id == id).AnyAsync();
    }

    // Get user stats
    public async Task<UserStatsDto> GetUserStatsAsync()
    {
        var totalUsers = await _users.CountDocumentsAsync(_ => true);
        var adminUsers = await _users.CountDocumentsAsync(x => x.Roles.Contains("Admin"));
        var regularUsers = await _users.CountDocumentsAsync(x => x.Roles.Contains("User") && !x.Roles.Contains("Admin"));

        var today = DateTime.UtcNow.Date;
        var newUsersToday = await _users.CountDocumentsAsync(x => x.CreatedAt >= today);

        var startOfMonth = new DateTime(today.Year, today.Month, 1);
        var newUsersThisMonth = await _users.CountDocumentsAsync(x => x.CreatedAt >= startOfMonth);

        return new UserStatsDto
        {
            TotalUsers = (int)totalUsers,
            AdminUsers = (int)adminUsers,
            RegularUsers = (int)regularUsers,
            NewUsersToday = (int)newUsersToday,
            NewUsersThisMonth = (int)newUsersThisMonth
        };
    }

    // Helper methods
    private FilterDefinition<User> BuildUserFilter(UserFilterDto request)
    {
        var builder = Builders<User>.Filter;
        var filters = new List<FilterDefinition<User>>();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchRegex = new MongoDB.Bson.BsonRegularExpression(request.Search, "i");
            var searchFilter = builder.Or(
                builder.Regex(x => x.FullName, searchRegex),
                builder.Regex(x => x.Phone, searchRegex),
                builder.Regex(x => x.Address, searchRegex)
            );
            filters.Add(searchFilter);
        }

        if (!string.IsNullOrEmpty(request.Role))
        {
            filters.Add(builder.AnyEq(x => x.Roles, request.Role));
        }

        if (!string.IsNullOrEmpty(request.Gender))
        {
            filters.Add(builder.Eq(x => x.Gender, request.Gender));
        }

        if (request.StartDate.HasValue)
        {
            filters.Add(builder.Gte(x => x.CreatedAt, request.StartDate.Value));
        }

        if (request.EndDate.HasValue)
        {
            filters.Add(builder.Lte(x => x.CreatedAt, request.EndDate.Value));
        }

        return filters.Count > 0 ? builder.And(filters) : builder.Empty;
    }

    private SortDefinition<User> BuildSortDefinition(PaginationRequest request)
    {
        var builder = Builders<User>.Sort;
        
        return request.SortBy?.ToLower() switch
        {
            "fullname" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.FullName) : builder.Descending(x => x.FullName),
            "phone" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.Phone) : builder.Descending(x => x.Phone),
            "point" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.Point) : builder.Descending(x => x.Point),
            "updated_at" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.UpdatedAt) : builder.Descending(x => x.UpdatedAt),
            _ => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.CreatedAt) : builder.Descending(x => x.CreatedAt)
        };
    }

    private AdminUserDto MapToAdminUserDto(User user)
    {
        return new AdminUserDto
        {
            Id = user.Id!,
            Phone = user.Phone,
            FullName = user.FullName,
            Gender = user.Gender,
            Address = user.Address,
            Point = user.Point,
            Roles = user.Roles,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}

public class UserStatsDto
{
    public int TotalUsers { get; set; }
    public int AdminUsers { get; set; }
    public int RegularUsers { get; set; }
    public int NewUsersToday { get; set; }
    public int NewUsersThisMonth { get; set; }
} 