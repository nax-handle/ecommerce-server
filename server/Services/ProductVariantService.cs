using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Toxos_V2.Models;
using Toxos_V2.Dtos;

namespace Toxos_V2.Services;

public class ProductVariantService
{
    private readonly IMongoCollection<ProductVariant> _variants;
    private readonly IMongoCollection<Product> _products;

    public ProductVariantService(MongoDBService mongoDBService)
    {
        _variants = mongoDBService.GetCollection<ProductVariant>("product_variants");
        _products = mongoDBService.GetCollection<Product>("products");
    }

    public async Task<List<ProductVariantDto>> GetVariantsByProductIdAsync(string productId)
    {
        var variants = await _variants.Find(x => x.ProductId == productId).ToListAsync();
        return variants.Select(MapToProductVariantDto).ToList();
    }

    public async Task<ProductVariantDto?> GetVariantByIdAsync(string variantId)
    {
        var variant = await _variants.Find(x => x.Id == variantId).FirstOrDefaultAsync();
        return variant != null ? MapToProductVariantDto(variant) : null;
    }

    public async Task<ProductVariantDto> CreateVariantAsync(string productId, CreateProductVariantDto createDto)
    {
        // Verify product exists
        var productExists = await _products.Find(x => x.Id == productId).AnyAsync();
        if (!productExists)
        {
            throw new ArgumentException("Product not found");
        }

        var variant = new ProductVariant
        {
            ProductId = productId,
            Discount = createDto.Discount,
            HardDrive = createDto.HardDrive,
            RAM = createDto.RAM,
            CPU = createDto.CPU,
            Price = createDto.Price,
            ColorRGB = createDto.ColorRGB,
            StockQuantity = createDto.StockQuantity,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _variants.InsertOneAsync(variant);
        return MapToProductVariantDto(variant);
    }

    public async Task<ProductVariantDto?> UpdateVariantAsync(string variantId, UpdateProductVariantDto updateDto)
    {
        var update = Builders<ProductVariant>.Update
            .Set(x => x.Discount, updateDto.Discount)
            .Set(x => x.HardDrive, updateDto.HardDrive)
            .Set(x => x.RAM, updateDto.RAM)
            .Set(x => x.CPU, updateDto.CPU)
            .Set(x => x.Price, updateDto.Price)
            .Set(x => x.ColorRGB, updateDto.ColorRGB)
            .Set(x => x.StockQuantity, updateDto.StockQuantity)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _variants.UpdateOneAsync(x => x.Id == variantId, update);
        
        if (result.MatchedCount == 0)
        {
            return null;
        }

        var updatedVariant = await _variants.Find(x => x.Id == variantId).FirstOrDefaultAsync();
        return updatedVariant != null ? MapToProductVariantDto(updatedVariant) : null;
    }

    public async Task<bool> DeleteVariantAsync(string variantId)
    {
        var variant = await _variants.Find(x => x.Id == variantId).FirstOrDefaultAsync();
        if (variant == null)
        {
            return false;
        }

        // Check if this is the last variant for the product
        var variantCount = await _variants.CountDocumentsAsync(x => x.ProductId == variant.ProductId);
        if (variantCount <= 1)
        {
            throw new ArgumentException("Cannot delete the last variant. Product must have at least one variant.");
        }

        var result = await _variants.DeleteOneAsync(x => x.Id == variantId);
        return result.DeletedCount > 0;
    }

    public async Task<ProductVariantDto?> UpdateVariantStockAsync(string variantId, int stockQuantity)
    {
        var update = Builders<ProductVariant>.Update
            .Set(x => x.StockQuantity, stockQuantity)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _variants.UpdateOneAsync(x => x.Id == variantId, update);
        
        if (result.MatchedCount == 0)
        {
            return null;
        }

        var updatedVariant = await _variants.Find(x => x.Id == variantId).FirstOrDefaultAsync();
        return updatedVariant != null ? MapToProductVariantDto(updatedVariant) : null;
    }

    public async Task<List<ProductVariantDto>> UpdateMultipleVariantStockAsync(List<UpdateVariantStockDto> updates)
    {
        var updatedVariants = new List<ProductVariantDto>();

        foreach (var update in updates)
        {
            var updatedVariant = await UpdateVariantStockAsync(update.VariantId, update.StockQuantity);
            
            if (updatedVariant != null)
            {
                updatedVariants.Add(updatedVariant);
            }
        }

        return updatedVariants;
    }

    public async Task<ProductVariantDto?> AdjustVariantStockAsync(string variantId, int stockAdjustment)
    {
        var variant = await _variants.Find(x => x.Id == variantId).FirstOrDefaultAsync();
        if (variant == null)
        {
            return null;
        }

        var newStock = Math.Max(0, variant.StockQuantity + stockAdjustment);
        return await UpdateVariantStockAsync(variantId, newStock);
    }

    public async Task UpdateProductStockAsync(string productId, string variantId, int soldQuantityChange, int stockQuantityChange)
    {
        var update = Builders<ProductVariant>.Update.Combine(
            Builders<ProductVariant>.Update.Inc(x => x.SoldQuantity, soldQuantityChange),
            Builders<ProductVariant>.Update.Inc(x => x.StockQuantity, stockQuantityChange),
            Builders<ProductVariant>.Update.Set(x => x.UpdatedAt, DateTime.UtcNow)
        );

        await _variants.UpdateOneAsync(x => x.Id == variantId && x.ProductId == productId, update);
    }

    public async Task IncrementViewCountAsync(string productId)
    {
        var update = Builders<ProductVariant>.Update
            .Inc(x => x.ViewQuantity, 1)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        await _variants.UpdateManyAsync(x => x.ProductId == productId, update);
    }

    private ProductVariantDto MapToProductVariantDto(ProductVariant variant)
    {
        return new ProductVariantDto
        {
            Id = variant.Id!,
            ProductId = variant.ProductId,
            Discount = variant.Discount,
            HardDrive = variant.HardDrive,
            RAM = variant.RAM,
            CPU = variant.CPU,
            Price = variant.Price,
            ColorRGB = variant.ColorRGB,
            StockQuantity = variant.StockQuantity,
            SoldQuantity = variant.SoldQuantity,
            ViewQuantity = variant.ViewQuantity
        };
    }
}