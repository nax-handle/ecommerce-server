using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Toxos_V2.Models;

public class Voucher
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("discount_type")]
    public required string DiscountType { get; set; }

    [BsonElement("image")]
    public string? Image { get; set; }

    [BsonElement("discount")]
    public int Discount { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("min_value")]
    public int MinValue { get; set; } = 0;

    [BsonElement("amount")]
    public int Amount { get; set; } = 1;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 