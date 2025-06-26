using MongoDB.Driver;
using Toxos_V2.Models;
using Toxos_V2.Dtos;

namespace Toxos_V2.Services;

public class VoucherService
{
    private readonly IMongoCollection<Voucher> _vouchers;
    private readonly CloudinaryFileUploadService _fileUploadService;
    private readonly ProductVariantService _productVariantService;

    public VoucherService(MongoDBService mongoDBService, CloudinaryFileUploadService fileUploadService, ProductVariantService productVariantService)
    {
        _vouchers = mongoDBService.GetCollection<Voucher>("vouchers");
        _fileUploadService = fileUploadService;
        _productVariantService = productVariantService;
    }

    // User endpoints - Get available vouchers
    public async Task<PaginatedResponse<VoucherListDto>> GetVouchersForUserAsync(PaginationRequest request)
    {
        var filter = BuildSearchFilter(request);
        var sortDefinition = BuildSortDefinition(request);

        var totalCount = await _vouchers.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var vouchers = await _vouchers
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var voucherDtos = vouchers.Select(MapToVoucherListDto).ToList();

        return new PaginatedResponse<VoucherListDto>
        {
            Data = voucherDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    public async Task<VoucherDetailDto?> GetVoucherDetailForUserAsync(string id)
    {
        var voucher = await _vouchers.Find(x => x.Id == id).FirstOrDefaultAsync();
        return voucher != null ? MapToVoucherDetailDto(voucher) : null;
    }

    // User endpoint - Apply voucher to cart/order
    public async Task<VoucherApplicationResultDto> ApplyVoucherAsync(ApplyVoucherDto applyVoucherDto)
    {
        // Get voucher by name
        var voucher = await _vouchers.Find(x => x.Name == applyVoucherDto.VoucherName).FirstOrDefaultAsync();
        
        if (voucher == null)
        {
            return new VoucherApplicationResultDto
            {
                IsValid = false,
                Message = "Voucher not found",
                DiscountAmount = 0,
                FinalTotal = 0
            };
        }

        // Check if voucher is still available
        if (voucher.Amount <= 0)
        {
            return new VoucherApplicationResultDto
            {
                IsValid = false,
                Message = "Voucher is no longer available",
                DiscountAmount = 0,
                FinalTotal = 0
            };
        }

        // Calculate total price from variant IDs
        int orderTotal = 0;

        foreach (var item in applyVoucherDto.Items)
        {
            var variant = await _productVariantService.GetVariantByIdAsync(item.VariantId);
            if (variant == null)
            {
                return new VoucherApplicationResultDto
                {
                    IsValid = false,
                    Message = $"Variant with ID {item.VariantId} not found",
                    DiscountAmount = 0,
                    FinalTotal = 0
                };
            }

            // Calculate price (apply variant discount if any)
            int unitPrice = variant.Price;
            if (variant.Discount > 0)
            {
                unitPrice = unitPrice - (unitPrice * variant.Discount / 100);
            }

            orderTotal += unitPrice * item.Quantity;
        }

        if (orderTotal < voucher.MinValue)
        {
            return new VoucherApplicationResultDto
            {
                IsValid = false,
                Message = $"Order total must be at least {voucher.MinValue} to use this voucher",
                DiscountAmount = 0,
                FinalTotal = orderTotal,
                Voucher = MapToVoucherDetailDto(voucher)
            };
        }

        // Calculate discount based on type
        int discountAmount = voucher.DiscountType.ToLower() == "percentage"
            ? (int)(orderTotal * voucher.Discount / 100.0)
            : voucher.Discount;

        // Ensure discount doesn't exceed order total
        discountAmount = Math.Min(discountAmount, orderTotal);
        var finalTotal = Math.Max(0, orderTotal - discountAmount);

        return new VoucherApplicationResultDto
        {
            IsValid = true,
            Message = "Voucher applied successfully",
            DiscountAmount = discountAmount,
            FinalTotal = finalTotal,
            Voucher = MapToVoucherDetailDto(voucher)
        };
    }

    // Admin endpoints
    public async Task<PaginatedResponse<VoucherAdminDto>> GetVouchersForAdminAsync(PaginationRequest request)
    {
        var filter = BuildSearchFilter(request);
        var sortDefinition = BuildSortDefinition(request);

        var totalCount = await _vouchers.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var vouchers = await _vouchers
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var voucherDtos = vouchers.Select(MapToVoucherAdminDto).ToList();

        return new PaginatedResponse<VoucherAdminDto>
        {
            Data = voucherDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    public async Task<VoucherAdminDto?> GetVoucherByIdForAdminAsync(string id)
    {
        var voucher = await _vouchers.Find(x => x.Id == id).FirstOrDefaultAsync();
        return voucher != null ? MapToVoucherAdminDto(voucher) : null;
    }

    public async Task<VoucherAdminDto> CreateVoucherAsync(CreateVoucherDto createVoucherDto)
    {
        // Validate discount value based on type
        if (createVoucherDto.DiscountType.ToLower() == "percentage" && createVoucherDto.Discount > 100)
        {
            throw new ArgumentException("Percentage discount cannot exceed 100%");
        }

        // Upload image if provided
        string? imagePath = null;
        if (createVoucherDto.ImageFile != null)
        {
            imagePath = await _fileUploadService.UploadThumbnailAsync(createVoucherDto.ImageFile);
        }

        var voucher = new Voucher
        {
            Name = createVoucherDto.Name,
            DiscountType = createVoucherDto.DiscountType.ToLower(),
            Image = imagePath,
            Discount = createVoucherDto.Discount,
            Description = createVoucherDto.Description,
            MinValue = createVoucherDto.MinValue,
            Amount = createVoucherDto.Amount,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _vouchers.InsertOneAsync(voucher);
        return MapToVoucherAdminDto(voucher);
    }

    public async Task<VoucherAdminDto?> UpdateVoucherAsync(string id, UpdateVoucherDto updateVoucherDto)
    {
        var existingVoucher = await _vouchers.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existingVoucher == null)
        {
            return null;
        }

        // Validate discount value based on type
        if (updateVoucherDto.DiscountType.ToLower() == "percentage" && updateVoucherDto.Discount > 100)
        {
            throw new ArgumentException("Percentage discount cannot exceed 100%");
        }

        // Upload new image if provided, otherwise keep existing
        string? imagePath = existingVoucher.Image;
        if (updateVoucherDto.ImageFile != null)
        {
            imagePath = await _fileUploadService.UploadThumbnailAsync(updateVoucherDto.ImageFile);
        }

        var updateDefinition = Builders<Voucher>.Update
            .Set(x => x.Name, updateVoucherDto.Name)
            .Set(x => x.DiscountType, updateVoucherDto.DiscountType.ToLower())
            .Set(x => x.Image, imagePath)
            .Set(x => x.Discount, updateVoucherDto.Discount)
            .Set(x => x.Description, updateVoucherDto.Description)
            .Set(x => x.MinValue, updateVoucherDto.MinValue)
            .Set(x => x.Amount, updateVoucherDto.Amount)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        await _vouchers.UpdateOneAsync(x => x.Id == id, updateDefinition);

        var updatedVoucher = await _vouchers.Find(x => x.Id == id).FirstOrDefaultAsync();
        return MapToVoucherAdminDto(updatedVoucher!);
    }

    public async Task<bool> DeleteVoucherAsync(string id)
    {
        var result = await _vouchers.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> VoucherExistsAsync(string id)
    {
        return await _vouchers.Find(x => x.Id == id).AnyAsync();
    }

    // Helper methods
    private FilterDefinition<Voucher> BuildSearchFilter(PaginationRequest request)
    {
        var builder = Builders<Voucher>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchRegex = new MongoDB.Bson.BsonRegularExpression(request.Search, "i");
            var searchFilter = builder.Or(
                builder.Regex(x => x.Name, searchRegex),
                builder.Regex(x => x.Description, searchRegex),
                builder.Regex(x => x.DiscountType, searchRegex)
            );
            filter = builder.And(filter, searchFilter);
        }

        return filter;
    }

    private SortDefinition<Voucher> BuildSortDefinition(PaginationRequest request)
    {
        var builder = Builders<Voucher>.Sort;
        
        return request.SortBy?.ToLower() switch
        {
            "name" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.Name) : builder.Descending(x => x.Name),
            "discount" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.Discount) : builder.Descending(x => x.Discount),
            "min_value" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.MinValue) : builder.Descending(x => x.MinValue),
            "updated_at" => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.UpdatedAt) : builder.Descending(x => x.UpdatedAt),
            _ => request.SortOrder?.ToLower() == "asc" ? builder.Ascending(x => x.CreatedAt) : builder.Descending(x => x.CreatedAt)
        };
    }

    // Method to decrease voucher amount when used
    public async Task<bool> DecreaseVoucherAmountAsync(string voucherId)
    {
        var filter = Builders<Voucher>.Filter.And(
            Builders<Voucher>.Filter.Eq(x => x.Id, voucherId),
            Builders<Voucher>.Filter.Gt(x => x.Amount, 0)
        );

        var update = Builders<Voucher>.Update
            .Inc(x => x.Amount, -1)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _vouchers.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    // Mapping methods
    private VoucherListDto MapToVoucherListDto(Voucher voucher)
    {
        return new VoucherListDto
        {
            Id = voucher.Id!,
            Name = voucher.Name,
            DiscountType = voucher.DiscountType,
            Image = voucher.Image,
            Discount = voucher.Discount,
            Description = voucher.Description,
            MinValue = voucher.MinValue,
            Amount = voucher.Amount
        };
    }

    private VoucherDetailDto MapToVoucherDetailDto(Voucher voucher)
    {
        return new VoucherDetailDto
        {
            Id = voucher.Id!,
            Name = voucher.Name,
            DiscountType = voucher.DiscountType,
            Image = voucher.Image,
            Discount = voucher.Discount,
            Description = voucher.Description,
            MinValue = voucher.MinValue,
            Amount = voucher.Amount,
            CreatedAt = voucher.CreatedAt,
            UpdatedAt = voucher.UpdatedAt
        };
    }

    private VoucherAdminDto MapToVoucherAdminDto(Voucher voucher)
    {
        return new VoucherAdminDto
        {
            Id = voucher.Id!,
            Name = voucher.Name,
            DiscountType = voucher.DiscountType,
            Image = voucher.Image,
            Discount = voucher.Discount,
            Description = voucher.Description,
            MinValue = voucher.MinValue,
            Amount = voucher.Amount,
            CreatedAt = voucher.CreatedAt,
            UpdatedAt = voucher.UpdatedAt
        };
    }
} 