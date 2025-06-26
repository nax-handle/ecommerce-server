using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Toxos_V2.Models;

namespace Toxos_V2.Dtos;

// Base pagination request
public class PaginationRequest
{
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;

    public string? Search { get; set; }
    public string? CategoryId { get; set; }
    public string? SortBy { get; set; } = "created_at";
    public string? SortOrder { get; set; } = "desc";
}

// Pagination response wrapper
public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

// Product variant DTOs
public class ProductVariantDto
{
    public required string Id { get; set; }
    public required string ProductId { get; set; }
    public int Discount { get; set; }
    public string? HardDrive { get; set; }
    public string? RAM { get; set; }
    public string? CPU { get; set; }
    public int Price { get; set; }
    public int ColorRGB { get; set; }
    public int StockQuantity { get; set; }
    public int SoldQuantity { get; set; }
    public int ViewQuantity { get; set; }
}

public class CreateProductVariantDto
{
    [Range(0, 100)]
    public int Discount { get; set; } = 0;

    public string? HardDrive { get; set; }
    public string? RAM { get; set; }
    public string? CPU { get; set; }

    [Range(0, int.MaxValue)]
    public int Price { get; set; }

    public int ColorRGB { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; } = 0;
}

public class UpdateProductVariantDto
{
    [Range(0, 100)]
    public int Discount { get; set; } = 0;

    public string? HardDrive { get; set; }
    public string? RAM { get; set; }
    public string? CPU { get; set; }

    [Range(0, int.MaxValue)]
    public int Price { get; set; }

    public int ColorRGB { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; } = 0;
}

public class ProductImageDto
{
    public required string Image { get; set; }
}

// User view DTOs (simplified)
public class ProductListDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Thumbnail { get; set; }
    public decimal Rating { get; set; }
    public int MinPrice { get; set; }
    public int MaxPrice { get; set; }
    public bool HasDiscount { get; set; }
    public int MaxDiscount { get; set; }
}

public class ProductDetailDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Thumbnail { get; set; }
    public string? Screen { get; set; }
    public string? GraphicCard { get; set; }
    public string? Connector { get; set; }
    public string? OS { get; set; }
    public string? Design { get; set; }
    public string? Size { get; set; }
    public string? Mass { get; set; }
    public string? Pin { get; set; }
    public required string CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public decimal Rating { get; set; }
    public List<ProductVariantDto> Variants { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
}

// Admin view DTOs (complete)
public class ProductAdminDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Thumbnail { get; set; }
    public string? Screen { get; set; }
    public string? GraphicCard { get; set; }
    public string? Connector { get; set; }
    public string? OS { get; set; }
    public string? Design { get; set; }
    public string? Size { get; set; }
    public string? Mass { get; set; }
    public string? Pin { get; set; }
    public required string CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public decimal Rating { get; set; }
    public List<ProductVariantDto> Variants { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateProductDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public required string Name { get; set; }

    // Slug will be auto-generated from Name, but can be provided manually
    [StringLength(250, MinimumLength = 2)]
    public string? Slug { get; set; }

    // Thumbnail will be uploaded as file, not string
    public IFormFile? ThumbnailFile { get; set; }

    public string? Screen { get; set; }
    public string? GraphicCard { get; set; }
    public string? Connector { get; set; }
    public string? OS { get; set; }
    public string? Design { get; set; }
    public string? Size { get; set; }
    public string? Mass { get; set; }
    public string? Pin { get; set; }

    [Required]
    public required string CategoryId { get; set; }

    public List<CreateProductVariantDto> Variants { get; set; } = new();
    
    // Images will be uploaded as files, not strings
    public List<IFormFile>? ImageFiles { get; set; } = new();
}

public class UpdateProductDto
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public required string Name { get; set; }

    // Slug will be auto-generated from Name if not provided
    [StringLength(250, MinimumLength = 2)]
    public string? Slug { get; set; }

    // Optional new thumbnail file
    public IFormFile? ThumbnailFile { get; set; }

    public string? Screen { get; set; }
    public string? GraphicCard { get; set; }
    public string? Connector { get; set; }
    public string? OS { get; set; }
    public string? Design { get; set; }
    public string? Size { get; set; }
    public string? Mass { get; set; }
    public string? Pin { get; set; }

    [Required]
    public required string CategoryId { get; set; }

    public List<CreateProductVariantDto> Variants { get; set; } = new();
    
    // Optional new image files (will replace existing images)
    public List<IFormFile>? ImageFiles { get; set; } = new();
}

public class UpdateProductVariantStockDto
{
    public int StockQuantity { get; set; }
}

public class UpdateVariantStockDto
{
    public string VariantId { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}

public class StockAdjustmentDto
{
    public int StockAdjustment { get; set; }
} 