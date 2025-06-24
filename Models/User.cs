using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Toxos_V2.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("phone")]
    public required string Phone { get; set; }

    [BsonElement("point")]
    public int Point { get; set; } = 0;

    [BsonElement("gender")]
    public string? Gender { get; set; }

    [BsonElement("full_name")]
    public required string FullName { get; set; }

    [BsonElement("password_hash")]
    public required string PasswordHash { get; set; }

    [BsonElement("address")]
    public string? Address { get; set; }

    [BsonElement("roles")]
    public List<string> Roles { get; set; } = new List<string>();

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 