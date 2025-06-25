using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Toxos_V2.Models;

public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("total_price")]
    public int TotalPrice { get; set; }

    [BsonElement("status")]
    public required string Status { get; set; }

    [BsonElement("voucher_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? VoucherId { get; set; }

    [BsonElement("payment_type")]
    public required string PaymentType { get; set; }

    [BsonElement("address")]
    public required string Address { get; set; }

    [BsonElement("user_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string UserId { get; set; }

    [BsonElement("order_details")]
    public List<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class OrderDetail
{
    [BsonElement("product_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string ProductId { get; set; }

    [BsonElement("price")]
    public int Price { get; set; }

    [BsonElement("quantity")]
    public int Quantity { get; set; }

    [BsonElement("total")]
    public int Total { get; set; }

    [BsonElement("deadline")]
    public DateTime? Deadline { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 