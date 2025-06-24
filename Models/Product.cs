using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Toxos_V2.Models;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [BsonElement("slug")]
    public required string Slug { get; set; }

    [BsonElement("thumbnail")]
    public string? Thumbnail { get; set; }

    [BsonElement("screen")]
    public string? Screen { get; set; }

    [BsonElement("graphic_card")]
    public string? GraphicCard { get; set; }

    [BsonElement("connector")]
    public string? Connector { get; set; }

    [BsonElement("os")]
    public string? OS { get; set; }

    [BsonElement("design")]
    public string? Design { get; set; }

    [BsonElement("size")]
    public string? Size { get; set; }

    [BsonElement("mass")]
    public string? Mass { get; set; }

    [BsonElement("pin")]
    public string? Pin { get; set; }

    [BsonElement("category_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public required string CategoryId { get; set; }

    [BsonElement("rating")]
    public decimal Rating { get; set; } = 0;

    [BsonElement("variants")]
    public List<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

    [BsonElement("images")]
    public List<ProductImage> Images { get; set; } = new List<ProductImage>();

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductVariant
{
    [BsonElement("discount")]
    public int Discount { get; set; } = 0;

    [BsonElement("hard_drive")]
    public string? HardDrive { get; set; }

    [BsonElement("ram")]
    public string? RAM { get; set; }

    [BsonElement("cpu")]
    public string? CPU { get; set; }

    [BsonElement("price")]
    public int Price { get; set; }

    [BsonElement("color_rgb")]
    public int ColorRGB { get; set; }

    [BsonElement("sold_quantity")]
    public int SoldQuantity { get; set; } = 0;

    [BsonElement("view_quantity")]
    public int ViewQuantity { get; set; } = 0;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductImage
{
    [BsonElement("image")]
    public required string Image { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 