using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Toxos_V2.Models;

public class Cart
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("customer_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CustomerId { get; set; }

    [BsonElement("items")]
    public List<CartDetail> Items { get; set; } = new List<CartDetail>();

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CartDetail
{
    [BsonElement("product_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ProductId { get; set; }

    [BsonElement("quantity")]
    public int Quantity { get; set; } = 1;

    [BsonElement("total")]
    public int Total { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 