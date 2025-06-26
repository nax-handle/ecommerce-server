using System.ComponentModel.DataAnnotations;

namespace Toxos_V2.Dtos;

// Order status constants
public static class OrderStatus
{
    public const string Pending = "pending";
    public const string Confirmed = "confirmed";
    public const string Processing = "processing";
    public const string Shipped = "shipped";
    public const string Delivered = "delivered";
    public const string Cancelled = "cancelled";
    public const string Refunded = "refunded";
}

// Payment type constants
public static class PaymentType
{
    public const string Cash = "cash";
    public const string CreditCard = "credit_card";
    public const string BankTransfer = "bank_transfer";
    public const string DigitalWallet = "digital_wallet";
}

// Create order request from user
public class CreateOrderDto
{
    [Required]
    [StringLength(500, MinimumLength = 10)]
    public required string Address { get; set; }

    [Required]
    public required string PaymentType { get; set; }

    public string? VoucherId { get; set; }

    [Required]
    [MinLength(1)]
    public required List<CreateOrderItemDto> Items { get; set; }
}

public class CreateOrderItemDto
{
    [Required]
    public required string VariantId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public DateTime? Deadline { get; set; }
}

// Order response DTOs
public class OrderDto
{
    public required string Id { get; set; }
    public int TotalPrice { get; set; }
    public required string Status { get; set; }
    public string? VoucherId { get; set; }
    public string? VoucherName { get; set; }
    public int VoucherDiscount { get; set; }
    public required string PaymentType { get; set; }
    public required string Address { get; set; }
    public required string UserId { get; set; }
    public string? UserName { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class OrderItemDto
{
    public required string ProductId { get; set; }
    public required string VariantId { get; set; }
    public required string ProductName { get; set; }
    public string? ProductThumbnail { get; set; }
    public int Price { get; set; }
    public int Quantity { get; set; }
    public int Total { get; set; }
    public DateTime? Deadline { get; set; }
}

// User order list (simplified)
public class UserOrderDto
{
    public required string Id { get; set; }
    public int TotalPrice { get; set; }
    public required string Status { get; set; }
    public required string PaymentType { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Admin order management
public class AdminOrderDto
{
    public required string Id { get; set; }
    public int TotalPrice { get; set; }
    public required string Status { get; set; }
    public string? VoucherId { get; set; }
    public string? VoucherName { get; set; }
    public int VoucherDiscount { get; set; }
    public required string PaymentType { get; set; }
    public required string Address { get; set; }
    public required string UserId { get; set; }
    public required string UserName { get; set; }
    public string? UserPhone { get; set; }
    public List<AdminOrderItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AdminOrderItemDto
{
    public required string ProductId { get; set; }
    public required string VariantId { get; set; }
    public required string ProductName { get; set; }
    public string? ProductThumbnail { get; set; }
    public required string ProductSlug { get; set; }
    public int Price { get; set; }
    public int Quantity { get; set; }
    public int Total { get; set; }
    public DateTime? Deadline { get; set; }
    public int StockAfterOrder { get; set; } // For admin reference
}

// Update order status (admin only)
public class UpdateOrderStatusDto
{
    [Required]
    public required string Status { get; set; }

    public string? Notes { get; set; }
}

// Order statistics for admin
public class OrderStatsDto
{
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ProcessingOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public long TotalRevenue { get; set; }
    public long TodayRevenue { get; set; }
    public long MonthRevenue { get; set; }
}

// Order creation response
public class OrderCreationResponseDto
{
    public required string OrderId { get; set; }
    public int TotalPrice { get; set; }
    public int DiscountAmount { get; set; }
    public int FinalAmount { get; set; }
    public required string Status { get; set; }
    public required string Message { get; set; }
    public List<StockWarningDto>? StockWarnings { get; set; }
}

public class StockWarningDto
{
    public required string ProductId { get; set; }
    public required string ProductName { get; set; }
    public int RequestedQuantity { get; set; }
    public int AvailableStock { get; set; }
    public int AllocatedQuantity { get; set; }
}

// Order filters for admin
public class OrderFilterDto : PaginationRequest
{
    public string? Status { get; set; }
    public string? PaymentType { get; set; }
    public string? UserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? MinAmount { get; set; }
    public int? MaxAmount { get; set; }
} 