using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Toxos_V2.Models;
using Toxos_V2.Dtos;

namespace Toxos_V2.Services;

public class ProductService
{
    private readonly IMongoCollection<Product> _products;
    private readonly IMongoCollection<Category> _categories;
    private readonly CloudinaryFileUploadService _fileUploadService;
    private readonly ProductVariantService _productVariantService;

    public ProductService(MongoDBService mongoDBService, CloudinaryFileUploadService fileUploadService, ProductVariantService productVariantService)
    {
        _products = mongoDBService.GetCollection<Product>("products");
        _categories = mongoDBService.GetCollection<Category>("categories");
        _fileUploadService = fileUploadService;
        _productVariantService = productVariantService;
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

        var productDtos = new List<ProductListDto>();
        foreach (var product in products)
        {
            productDtos.Add(await MapToProductListDtoAsync(product));
        }

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
        await _productVariantService.IncrementViewCountAsync(id);

        return await MapToProductDetailDto(product);
    }

    public async Task<ProductDetailDto?> GetProductBySlugForUserAsync(string slug)
    {
        var product = await _products.Find(x => x.Slug == slug).FirstOrDefaultAsync();
        if (product == null) return null;

        // Increment view count for all variants
        await _productVariantService.IncrementViewCountAsync(product.Id!);

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

        // Auto-generate slug if not provided
        var slug = string.IsNullOrEmpty(createProductDto.Slug) 
            ? CloudinaryFileUploadService.GenerateSlug(createProductDto.Name)
            : CloudinaryFileUploadService.GenerateSlug(createProductDto.Slug);

        // Ensure slug is unique
        slug = await GenerateUniqueSlugAsync(slug);

        // Upload thumbnail if provided
        string? thumbnailPath = null;
        if (createProductDto.ThumbnailFile != null)
        {
            thumbnailPath = await _fileUploadService.UploadThumbnailAsync(createProductDto.ThumbnailFile);
        }

        // Upload images if provided
        var imagePaths = new List<string>();
        if (createProductDto.ImageFiles != null && createProductDto.ImageFiles.Any())
        {
            imagePaths = await _fileUploadService.UploadProductImagesAsync(createProductDto.ImageFiles);
        }

        var product = new Product
        {
            Name = createProductDto.Name,
            Slug = slug,
            Thumbnail = thumbnailPath,
            Screen = createProductDto.Screen,
            GraphicCard = createProductDto.GraphicCard,
            Connector = createProductDto.Connector,
            OS = createProductDto.OS,
            Design = createProductDto.Design,
            Size = createProductDto.Size,
            Mass = createProductDto.Mass,
            Pin = createProductDto.Pin,
            CategoryId = createProductDto.CategoryId,
            Images = imagePaths.Select(path => new ProductImage { Image = path, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }).ToList(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _products.InsertOneAsync(product);

        // Create variants in separate collection
        foreach (var variantDto in createProductDto.Variants)
        {
            await _productVariantService.CreateVariantAsync(product.Id!, variantDto);
        }

        return await MapToProductAdminDto(product);
    }

    public async Task<ProductAdminDto?> UpdateProductAsync(string id, UpdateProductDto updateProductDto)
    {
        // Get existing product
        var existingProduct = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existingProduct == null)
        {
            return null;
        }

        // Validate category exists
        var categoryExists = await _categories.Find(x => x.Id == updateProductDto.CategoryId).AnyAsync();
        if (!categoryExists)
        {
            throw new ArgumentException("Category does not exist");
        }

        // Auto-generate slug if not provided or if name changed
        var slug = string.IsNullOrEmpty(updateProductDto.Slug) 
            ? CloudinaryFileUploadService.GenerateSlug(updateProductDto.Name)
            : CloudinaryFileUploadService.GenerateSlug(updateProductDto.Slug);

        // Ensure slug is unique (excluding current product)
        if (slug != existingProduct.Slug)
        {
            slug = await GenerateUniqueSlugAsync(slug, id);
        }

        // Handle thumbnail upload
        string? thumbnailPath = existingProduct.Thumbnail;
        if (updateProductDto.ThumbnailFile != null)
        {
            // Delete old thumbnail if exists
            if (!string.IsNullOrEmpty(existingProduct.Thumbnail))
            {
                await _fileUploadService.DeleteFileAsync(existingProduct.Thumbnail);
            }
            
            thumbnailPath = await _fileUploadService.UploadThumbnailAsync(updateProductDto.ThumbnailFile);
        }

        // Handle images upload
        var imagePaths = existingProduct.Images.Select(img => img.Image).ToList();
        if (updateProductDto.ImageFiles != null && updateProductDto.ImageFiles.Any())
        {
            // Delete old images
            await _fileUploadService.DeleteMultipleFilesAsync(imagePaths);
            
            // Upload new images
            imagePaths = await _fileUploadService.UploadProductImagesAsync(updateProductDto.ImageFiles);
        }

        var updateDefinition = Builders<Product>.Update
            .Set(x => x.Name, updateProductDto.Name)
            .Set(x => x.Slug, slug)
            .Set(x => x.Thumbnail, thumbnailPath)
            .Set(x => x.Screen, updateProductDto.Screen)
            .Set(x => x.GraphicCard, updateProductDto.GraphicCard)
            .Set(x => x.Connector, updateProductDto.Connector)
            .Set(x => x.OS, updateProductDto.OS)
            .Set(x => x.Design, updateProductDto.Design)
            .Set(x => x.Size, updateProductDto.Size)
            .Set(x => x.Mass, updateProductDto.Mass)
            .Set(x => x.Pin, updateProductDto.Pin)
            .Set(x => x.CategoryId, updateProductDto.CategoryId)
            .Set(x => x.Images, imagePaths.Select(path => new ProductImage { Image = path, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }).ToList())
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _products.UpdateOneAsync(x => x.Id == id, updateDefinition);

        // Note: Variants are now managed separately through ProductVariantService
        // If you need to update variants, use the ProductVariantController endpoints
        
        if (result.MatchedCount == 0)
        {
            return null;
        }

        var updatedProduct = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        return updatedProduct != null ? await MapToProductAdminDto(updatedProduct) : null;
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        // Get product to delete associated files
        var product = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (product == null)
        {
            return false;
        }

        // Delete associated files
        if (!string.IsNullOrEmpty(product.Thumbnail))
        {
            await _fileUploadService.DeleteFileAsync(product.Thumbnail);
        }

        var imagePaths = product.Images.Select(img => img.Image).ToList();
        if (imagePaths.Any())
        {
            await _fileUploadService.DeleteMultipleFilesAsync(imagePaths);
        }

        var result = await _products.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> ProductExistsAsync(string id)
    {
        var count = await _products.CountDocumentsAsync(x => x.Id == id);
        return count > 0;
    }

    // Note: Variant management methods have been moved to ProductVariantService
    // Use ProductVariantController endpoints for variant operations

    // Helper methods
    private async Task<string> GenerateUniqueSlugAsync(string baseSlug, string? excludeId = null)
    {
        var slug = baseSlug;
        var counter = 1;

        while (await SlugExistsAsync(slug, excludeId))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private async Task<bool> SlugExistsAsync(string slug, string? excludeId = null)
    {
        var filter = Builders<Product>.Filter.Eq(x => x.Slug, slug);
        
        if (!string.IsNullOrEmpty(excludeId))
        {
            filter = Builders<Product>.Filter.And(
                filter,
                Builders<Product>.Filter.Ne(x => x.Id, excludeId)
            );
        }

        var count = await _products.CountDocumentsAsync(filter);
        return count > 0;
    }

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

    private async Task<ProductListDto> MapToProductListDtoAsync(Product product)
    {
        var variants = await _productVariantService.GetVariantsByProductIdAsync(product.Id!);
        var prices = variants.Where(v => v.Price > 0).Select(v => v.Price).ToList();
        var discounts = variants.Where(v => v.Discount > 0).Select(v => v.Discount).ToList();

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
        var variants = await _productVariantService.GetVariantsByProductIdAsync(product.Id!);

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
            Variants = variants,
            Images = product.Images.Select(MapToProductImageDto).ToList()
        };
    }

    private async Task<ProductAdminDto> MapToProductAdminDto(Product product)
    {
        var category = await _categories.Find(x => x.Id == product.CategoryId).FirstOrDefaultAsync();
        var variants = await _productVariantService.GetVariantsByProductIdAsync(product.Id!);

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
            Variants = variants,
            Images = product.Images.Select(MapToProductImageDto).ToList(),
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }

    private ProductImageDto MapToProductImageDto(ProductImage image)
    {
        return new ProductImageDto
        {
            Image = image.Image
        };
    }
} 