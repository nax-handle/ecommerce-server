using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Toxos_V2.Models;
using Toxos_V2.Dtos;

namespace Toxos_V2.Services;

public class ProductService
{
    private readonly IMongoCollection<Product> _products;
    private readonly IMongoCollection<Category> _categories;

    public ProductService(MongoDBService mongoDBService)
    {
        _products = mongoDBService.GetCollection<Product>("products");
        _categories = mongoDBService.GetCollection<Category>("categories");
    }

    // User endpoints with pagination
    public async Task<PaginatedResponse<ProductListDto>> GetProductsForUserAsync(PaginationRequest request)
    {
        var filter = BuildSearchFilter(request);
        var sortDefinition = BuildSortDefinition(request);

        var totalCount = await _products.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var products = await _products
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var productDtos = products.Select(MapToProductListDto).ToList();

        return new PaginatedResponse<ProductListDto>
        {
            Data = productDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    public async Task<ProductDetailDto?> GetProductDetailForUserAsync(string id)
    {
        var product = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (product == null) return null;

        // Increment view count for all variants
        var updateDefinition = Builders<Product>.Update
            .Inc("variants.$[].view_quantity", 1);

        await _products.UpdateOneAsync(x => x.Id == id, updateDefinition);

        return await MapToProductDetailDto(product);
    }

    public async Task<ProductDetailDto?> GetProductBySlugForUserAsync(string slug)
    {
        var product = await _products.Find(x => x.Slug == slug).FirstOrDefaultAsync();
        if (product == null) return null;

        // Increment view count for all variants
        var updateDefinition = Builders<Product>.Update
            .Inc("variants.$[].view_quantity", 1);

        await _products.UpdateOneAsync(x => x.Id == product.Id, updateDefinition);

        return await MapToProductDetailDto(product);
    }

    // Admin endpoints with pagination
    public async Task<PaginatedResponse<ProductAdminDto>> GetProductsForAdminAsync(PaginationRequest request)
    {
        var filter = BuildSearchFilter(request);
        var sortDefinition = BuildSortDefinition(request);

        var totalCount = await _products.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var products = await _products
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var productDtos = new List<ProductAdminDto>();
        foreach (var product in products)
        {
            productDtos.Add(await MapToProductAdminDto(product));
        }

        return new PaginatedResponse<ProductAdminDto>
        {
            Data = productDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    public async Task<ProductAdminDto?> GetProductByIdForAdminAsync(string id)
    {
        var product = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        return product != null ? await MapToProductAdminDto(product) : null;
    }

    public async Task<ProductAdminDto> CreateProductAsync(CreateProductDto createProductDto)
    {
        // Validate category exists
        var categoryExists = await _categories.Find(x => x.Id == createProductDto.CategoryId).AnyAsync();
        if (!categoryExists)
        {
            throw new ArgumentException("Category does not exist");
        }

        // Check if product with same slug already exists
        var existingProduct = await _products.Find(x => x.Slug == createProductDto.Slug).FirstOrDefaultAsync();
        if (existingProduct != null)
        {
            throw new ArgumentException("Product with this slug already exists");
        }

        var product = new Product
        {
            Name = createProductDto.Name,
            Slug = createProductDto.Slug,
            Thumbnail = createProductDto.Thumbnail,
            Screen = createProductDto.Screen,
            GraphicCard = createProductDto.GraphicCard,
            Connector = createProductDto.Connector,
            OS = createProductDto.OS,
            Design = createProductDto.Design,
            Size = createProductDto.Size,
            Mass = createProductDto.Mass,
            Pin = createProductDto.Pin,
            CategoryId = createProductDto.CategoryId,
            Variants = createProductDto.Variants.Select(MapToProductVariant).ToList(),
            Images = createProductDto.Images.Select(MapToProductImage).ToList(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _products.InsertOneAsync(product);
        return await MapToProductAdminDto(product);
    }

    public async Task<ProductAdminDto?> UpdateProductAsync(string id, UpdateProductDto updateProductDto)
    {
        // Validate category exists
        var categoryExists = await _categories.Find(x => x.Id == updateProductDto.CategoryId).AnyAsync();
        if (!categoryExists)
        {
            throw new ArgumentException("Category does not exist");
        }

        // Check if another product with same slug exists
        var existingProduct = await _products.Find(x => x.Slug == updateProductDto.Slug && x.Id != id).FirstOrDefaultAsync();
        if (existingProduct != null)
        {
            throw new ArgumentException("Product with this slug already exists");
        }

        var updateDefinition = Builders<Product>.Update
            .Set(x => x.Name, updateProductDto.Name)
            .Set(x => x.Slug, updateProductDto.Slug)
            .Set(x => x.Thumbnail, updateProductDto.Thumbnail)
            .Set(x => x.Screen, updateProductDto.Screen)
            .Set(x => x.GraphicCard, updateProductDto.GraphicCard)
            .Set(x => x.Connector, updateProductDto.Connector)
            .Set(x => x.OS, updateProductDto.OS)
            .Set(x => x.Design, updateProductDto.Design)
            .Set(x => x.Size, updateProductDto.Size)
            .Set(x => x.Mass, updateProductDto.Mass)
            .Set(x => x.Pin, updateProductDto.Pin)
            .Set(x => x.CategoryId, updateProductDto.CategoryId)
            .Set(x => x.Variants, updateProductDto.Variants.Select(MapToProductVariant).ToList())
            .Set(x => x.Images, updateProductDto.Images.Select(MapToProductImage).ToList())
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _products.UpdateOneAsync(x => x.Id == id, updateDefinition);
        
        if (result.MatchedCount == 0)
        {
            return null;
        }

        var updatedProduct = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        return updatedProduct != null ? await MapToProductAdminDto(updatedProduct) : null;
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        var result = await _products.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ProductExistsAsync(string id)
    {
        var count = await _products.CountDocumentsAsync(x => x.Id == id);
        return count > 0;
    }

    // Helper methods
    private FilterDefinition<Product> BuildSearchFilter(PaginationRequest request)
    {
        var filterBuilder = Builders<Product>.Filter;
        var filters = new List<FilterDefinition<Product>>();

        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchFilter = filterBuilder.Or(
                filterBuilder.Regex(x => x.Name, new MongoDB.Bson.BsonRegularExpression(request.Search, "i")),
                filterBuilder.Regex(x => x.Slug, new MongoDB.Bson.BsonRegularExpression(request.Search, "i"))
            );
            filters.Add(searchFilter);
        }

        if (!string.IsNullOrEmpty(request.CategoryId))
        {
            filters.Add(filterBuilder.Eq(x => x.CategoryId, request.CategoryId));
        }

        return filters.Count > 0 ? filterBuilder.And(filters) : filterBuilder.Empty;
    }

    private SortDefinition<Product> BuildSortDefinition(PaginationRequest request)
    {
        var sortBuilder = Builders<Product>.Sort;
        var isDescending = request.SortOrder?.ToLower() == "desc";

        return request.SortBy?.ToLower() switch
        {
            "name" => isDescending ? sortBuilder.Descending(x => x.Name) : sortBuilder.Ascending(x => x.Name),
            "rating" => isDescending ? sortBuilder.Descending(x => x.Rating) : sortBuilder.Ascending(x => x.Rating),
            "updated_at" => isDescending ? sortBuilder.Descending(x => x.UpdatedAt) : sortBuilder.Ascending(x => x.UpdatedAt),
            _ => isDescending ? sortBuilder.Descending(x => x.CreatedAt) : sortBuilder.Ascending(x => x.CreatedAt)
        };
    }

    private ProductListDto MapToProductListDto(Product product)
    {
        var prices = product.Variants.Where(v => v.Price > 0).Select(v => v.Price).ToList();
        var discounts = product.Variants.Where(v => v.Discount > 0).Select(v => v.Discount).ToList();

        return new ProductListDto
        {
            Id = product.Id!,
            Name = product.Name,
            Slug = product.Slug,
            Thumbnail = product.Thumbnail,
            Rating = product.Rating,
            MinPrice = prices.Any() ? prices.Min() : 0,
            MaxPrice = prices.Any() ? prices.Max() : 0,
            HasDiscount = discounts.Any(),
            MaxDiscount = discounts.Any() ? discounts.Max() : 0
        };
    }

    private async Task<ProductDetailDto> MapToProductDetailDto(Product product)
    {
        var category = await _categories.Find(x => x.Id == product.CategoryId).FirstOrDefaultAsync();

        return new ProductDetailDto
        {
            Id = product.Id!,
            Name = product.Name,
            Slug = product.Slug,
            Thumbnail = product.Thumbnail,
            Screen = product.Screen,
            GraphicCard = product.GraphicCard,
            Connector = product.Connector,
            OS = product.OS,
            Design = product.Design,
            Size = product.Size,
            Mass = product.Mass,
            Pin = product.Pin,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name,
            Rating = product.Rating,
            Variants = product.Variants.Select(MapToProductVariantDto).ToList(),
            Images = product.Images.Select(MapToProductImageDto).ToList()
        };
    }

    private async Task<ProductAdminDto> MapToProductAdminDto(Product product)
    {
        var category = await _categories.Find(x => x.Id == product.CategoryId).FirstOrDefaultAsync();

        return new ProductAdminDto
        {
            Id = product.Id!,
            Name = product.Name,
            Slug = product.Slug,
            Thumbnail = product.Thumbnail,
            Screen = product.Screen,
            GraphicCard = product.GraphicCard,
            Connector = product.Connector,
            OS = product.OS,
            Design = product.Design,
            Size = product.Size,
            Mass = product.Mass,
            Pin = product.Pin,
            CategoryId = product.CategoryId,
            CategoryName = category?.Name,
            Rating = product.Rating,
            Variants = product.Variants.Select(MapToProductVariantDto).ToList(),
            Images = product.Images.Select(MapToProductImageDto).ToList(),
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }

    private ProductVariantDto MapToProductVariantDto(ProductVariant variant)
    {
        return new ProductVariantDto
        {
            Discount = variant.Discount,
            HardDrive = variant.HardDrive,
            RAM = variant.RAM,
            CPU = variant.CPU,
            Price = variant.Price,
            ColorRGB = variant.ColorRGB,
            SoldQuantity = variant.SoldQuantity,
            ViewQuantity = variant.ViewQuantity
        };
    }

    private ProductImageDto MapToProductImageDto(ProductImage image)
    {
        return new ProductImageDto
        {
            Image = image.Image
        };
    }

    private ProductVariant MapToProductVariant(CreateProductVariantDto variantDto)
    {
        return new ProductVariant
        {
            Discount = variantDto.Discount,
            HardDrive = variantDto.HardDrive,
            RAM = variantDto.RAM,
            CPU = variantDto.CPU,
            Price = variantDto.Price,
            ColorRGB = variantDto.ColorRGB,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private ProductImage MapToProductImage(ProductImageDto imageDto)
    {
        return new ProductImage
        {
            Image = imageDto.Image,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
} 