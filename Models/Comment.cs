using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Toxos_V2.Models;

public class Comment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("product_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ProductId { get; set; }

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; set; }

    [BsonElement("content")]
    public required string Content { get; set; }

    [BsonElement("date_comment")]
    public DateTime DateComment { get; set; } = DateTime.Today;

    [BsonElement("rating")]
    public int Rating { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 