using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Toxos_V2.Dtos;

// Voucher DTOs for User endpoints
public class VoucherListDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string DiscountType { get; set; }
    public string? Image { get; set; }
    public int Discount { get; set; }
    public string? Description { get; set; }
    public int MinValue { get; set; }
}

public class VoucherDetailDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string DiscountType { get; set; }
    public string? Image { get; set; }
    public int Discount { get; set; }
    public string? Description { get; set; }
    public int MinValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Voucher DTOs for Admin endpoints
public class VoucherAdminDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string DiscountType { get; set; }
    public string? Image { get; set; }
    public int Discount { get; set; }
    public string? Description { get; set; }
    public int MinValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// DTOs for Create/Update operations
public class CreateVoucherDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; set; }

    [Required]
    [RegularExpression("^(percentage|fixed)$", ErrorMessage = "DiscountType must be either 'percentage' or 'fixed'")]
    public required string DiscountType { get; set; }

    public IFormFile? ImageFile { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Discount must be a positive number")]
    public int Discount { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "MinValue must be a positive number")]
    public int MinValue { get; set; } = 0;
}

public class UpdateVoucherDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; set; }

    [Required]
    [RegularExpression("^(percentage|fixed)$", ErrorMessage = "DiscountType must be either 'percentage' or 'fixed'")]
    public required string DiscountType { get; set; }

    public IFormFile? ImageFile { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Discount must be a positive number")]
    public int Discount { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "MinValue must be a positive number")]
    public int MinValue { get; set; } = 0;
}

// DTO for voucher application by users
public class ApplyVoucherDto
{
    [Required]
    public required string VoucherName { get; set; }

    [Required]
    public required string OrderId { get; set; }
}

// DTO for voucher application response
public class VoucherApplicationResultDto
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public int DiscountAmount { get; set; }
    public int FinalTotal { get; set; }
    public VoucherDetailDto? Voucher { get; set; }
} 