using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Toxos_V2.Models;
using Toxos_V2.Dtos;

namespace Toxos_V2.Services;

public class OrderService
{
    private readonly IMongoCollection<Order> _orders;
    private readonly IMongoCollection<Product> _products;
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<Voucher> _vouchers;
    private readonly ProductVariantService _productVariantService;
    private readonly VoucherService _voucherService;

    public OrderService(MongoDBService mongoDBService, ProductVariantService productVariantService, VoucherService voucherService)
    {
        _orders = mongoDBService.GetCollection<Order>("orders");
        _products = mongoDBService.GetCollection<Product>("products");
        _users = mongoDBService.GetCollection<User>("users");
        _vouchers = mongoDBService.GetCollection<Voucher>("vouchers");
        _productVariantService = productVariantService;
        _voucherService = voucherService;
    }

    // User endpoints
    public async Task<OrderCreationResponseDto> CreateOrderAsync(string userId, CreateOrderDto createOrderDto)
    {
        using var session = await _orders.Database.Client.StartSessionAsync();
        session.StartTransaction();

        try
        {
            var orderItems = new List<OrderDetail>();
            var stockWarnings = new List<StockWarningDto>();

            int requestedTotalPrice = 0;
            int fulfilledTotalPrice = 0;

            foreach (var item in createOrderDto.Items)
            {
                var variant = await _productVariantService.GetVariantByIdAsync(item.VariantId);
                if (variant == null) throw new ArgumentException($"Variant {item.VariantId} not found");

                var product = await _products.Find(x => x.Id == variant.ProductId).FirstOrDefaultAsync();
                if (product == null) throw new ArgumentException($"Product {variant.ProductId} not found");

                int allocatedQuantity = Math.Min(item.Quantity, variant.StockQuantity);
                requestedTotalPrice += variant.Price * item.Quantity;
                fulfilledTotalPrice += variant.Price * allocatedQuantity;
                if (allocatedQuantity < item.Quantity)
                {
                    stockWarnings.Add(new StockWarningDto
                    {
                        ProductId = product.Id!,
                        ProductName = product.Name,
                        RequestedQuantity = item.Quantity,
                        AvailableStock = variant.StockQuantity,
                        AllocatedQuantity = allocatedQuantity
                    });
                }

                if (allocatedQuantity > 0)
                {
                    orderItems.Add(new OrderDetail
                    {
                        ProductId = product.Id!,
                        VariantId = variant.Id,
                        Price = variant.Price,
                        Quantity = allocatedQuantity,
                        Total = variant.Price * allocatedQuantity,
                        Deadline = item.Deadline,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    await UpdateVariantStockAsync(variant.Id, 0, -allocatedQuantity, session);
                }
            }

            if (!orderItems.Any())
                throw new ArgumentException("No items could be processed due to stock unavailability");

            // Apply voucher
            int discountAmount = 0;
            string? voucherId = null;

            if (!string.IsNullOrEmpty(createOrderDto.VoucherId))
            {
                var voucher = await _vouchers.Find(x => x.Id == createOrderDto.VoucherId).FirstOrDefaultAsync();
                if (voucher == null) throw new ArgumentException("Voucher not found");

                if (fulfilledTotalPrice < voucher.MinValue)
                    throw new ArgumentException("Total price is less than voucher minimum value");

                if (voucher.Amount <= 0)
                    throw new ArgumentException("Voucher is no longer available");

                voucherId = voucher.Id;
                discountAmount = voucher.DiscountType.ToLower() switch
                {
                    "percentage" => fulfilledTotalPrice * voucher.Discount / 100,
                    _ => Math.Min(voucher.Discount, fulfilledTotalPrice)
                };
            }

            int finalAmount = fulfilledTotalPrice - discountAmount;

            var order = new Order
            {
                TotalPrice = finalAmount,
                Status = OrderStatus.Pending,
                VoucherId = voucherId,
                PaymentType = createOrderDto.PaymentType,
                Address = createOrderDto.Address,
                UserId = userId,
                OrderDetails = orderItems,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _orders.InsertOneAsync(session, order);

            if (voucherId != null)
            {
                var updated = await _voucherService.DecreaseVoucherAmountAsync(voucherId);
                if (!updated)
                    throw new ArgumentException("Failed to update voucher amount. Voucher may have been exhausted.");
            }

            await session.CommitTransactionAsync();

            return new OrderCreationResponseDto
            {
                OrderId = order.Id!,
                TotalPrice = finalAmount,
                DiscountAmount = discountAmount,
                FinalAmount = requestedTotalPrice,
                Status = order.Status,
                Message = stockWarnings.Any() ? "Order created with stock limitations" : "Order created successfully",
                StockWarnings = stockWarnings.Any() ? stockWarnings : null
            };
        }
        catch
        {
            await session.AbortTransactionAsync();
            throw;
        }
    }


    public async Task<PaginatedResponse<UserOrderDto>> GetUserOrdersAsync(string userId, PaginationRequest request)
    {
        var filter = Builders<Order>.Filter.Eq(x => x.UserId, userId);

        // Apply search filter
        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchFilter = Builders<Order>.Filter.Or(
                Builders<Order>.Filter.Regex(x => x.Status, new MongoDB.Bson.BsonRegularExpression(request.Search, "i")),
                Builders<Order>.Filter.Regex(x => x.PaymentType, new MongoDB.Bson.BsonRegularExpression(request.Search, "i"))
            );
            filter = Builders<Order>.Filter.And(filter, searchFilter);
        }

        var totalCount = await _orders.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var sortDefinition = BuildSortDefinition(request);

        var orders = await _orders
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var orderDtos = orders.Select(order => new UserOrderDto
        {
            Id = order.Id!,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            PaymentType = order.PaymentType,
            ItemCount = order.OrderDetails.Count,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        }).ToList();

        return new PaginatedResponse<UserOrderDto>
        {
            Data = orderDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    public async Task<OrderDto?> GetUserOrderByIdAsync(string userId, string orderId)
    {
        var order = await _orders.Find(x => x.Id == orderId && x.UserId == userId).FirstOrDefaultAsync();
        if (order == null) return null;

        return await MapToOrderDtoAsync(order);
    }

    // Admin endpoints
    public async Task<PaginatedResponse<AdminOrderDto>> GetOrdersForAdminAsync(OrderFilterDto request)
    {
        var filter = BuildAdminOrderFilter(request);
        var totalCount = await _orders.CountDocumentsAsync(filter);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var sortDefinition = BuildSortDefinition(request);

        var orders = await _orders
            .Find(filter)
            .Sort(sortDefinition)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        var orderDtos = new List<AdminOrderDto>();
        foreach (var order in orders)
        {
            orderDtos.Add(await MapToAdminOrderDtoAsync(order));
        }

        return new PaginatedResponse<AdminOrderDto>
        {
            Data = orderDtos,
            TotalCount = (int)totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            HasNextPage = request.Page < totalPages,
            HasPreviousPage = request.Page > 1
        };
    }

    public async Task<AdminOrderDto?> GetOrderByIdForAdminAsync(string orderId)
    {
        var order = await _orders.Find(x => x.Id == orderId).FirstOrDefaultAsync();
        if (order == null) return null;

        return await MapToAdminOrderDtoAsync(order);
    }

    public async Task<AdminOrderDto?> UpdateOrderStatusAsync(string orderId, UpdateOrderStatusDto updateDto)
    {
        using var session = await _orders.Database.Client.StartSessionAsync();
        session.StartTransaction();

        try
        {
            var order = await _orders.Find(x => x.Id == orderId).FirstOrDefaultAsync();
            if (order == null) return null;

            string oldStatus = order.Status;
            string newStatus = updateDto.Status;

            // Handle stock changes based on status transitions
            await HandleStockOnStatusChangeAsync(order, oldStatus, newStatus, session);

            // Update order status
            var update = Builders<Order>.Update
                .Set(x => x.Status, newStatus)
                .Set(x => x.UpdatedAt, DateTime.UtcNow);

            await _orders.UpdateOneAsync(session, x => x.Id == orderId, update);

            await session.CommitTransactionAsync();

            // Return updated order
            var updatedOrder = await _orders.Find(x => x.Id == orderId).FirstOrDefaultAsync();
            return updatedOrder != null ? await MapToAdminOrderDtoAsync(updatedOrder) : null;
        }
        catch
        {
            await session.AbortTransactionAsync();
            throw;
        }
    }

    public async Task<OrderStatsDto> GetOrderStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var totalOrders = await _orders.CountDocumentsAsync(_ => true);
        var pendingOrders = await _orders.CountDocumentsAsync(x => x.Status == OrderStatus.Pending);
        var processingOrders = await _orders.CountDocumentsAsync(x => x.Status == OrderStatus.Processing);
        var completedOrders = await _orders.CountDocumentsAsync(x => x.Status == OrderStatus.Delivered);
        var cancelledOrders = await _orders.CountDocumentsAsync(x => x.Status == OrderStatus.Cancelled);

        // Calculate revenue
        var totalRevenue = await _orders.Aggregate()
            .Match(x => x.Status == OrderStatus.Delivered)
            .Group(x => 1, g => new { TotalRevenue = g.Sum(x => x.TotalPrice) })
            .FirstOrDefaultAsync();

        var todayRevenue = await _orders.Aggregate()
            .Match(x => x.Status == OrderStatus.Delivered && x.CreatedAt >= today)
            .Group(x => 1, g => new { TotalRevenue = g.Sum(x => x.TotalPrice) })
            .FirstOrDefaultAsync();

        var monthRevenue = await _orders.Aggregate()
            .Match(x => x.Status == OrderStatus.Delivered && x.CreatedAt >= startOfMonth)
            .Group(x => 1, g => new { TotalRevenue = g.Sum(x => x.TotalPrice) })
            .FirstOrDefaultAsync();

        return new OrderStatsDto
        {
            TotalOrders = (int)totalOrders,
            PendingOrders = (int)pendingOrders,
            ProcessingOrders = (int)processingOrders,
            CompletedOrders = (int)completedOrders,
            CancelledOrders = (int)cancelledOrders,
            TotalRevenue = totalRevenue?.TotalRevenue ?? 0,
            TodayRevenue = todayRevenue?.TotalRevenue ?? 0,
            MonthRevenue = monthRevenue?.TotalRevenue ?? 0
        };
    }

    // Helper methods
    private async Task HandleStockOnStatusChangeAsync(Order order, string oldStatus, string newStatus, IClientSessionHandle session)
    {
        // Stock is decreased when order is created (status = pending)
        // Stock should be restored if order is cancelled
        // Sold quantity should be updated when order is delivered

        if (newStatus == OrderStatus.Cancelled && oldStatus != OrderStatus.Cancelled)
        {
            // Restore stock for cancelled orders
            foreach (var item in order.OrderDetails)
            {
                await UpdateVariantStockAsync(item.VariantId, 0, item.Quantity, session);
            }
        }
        else if (newStatus == OrderStatus.Delivered && oldStatus != OrderStatus.Delivered)
        {
            // Update sold quantity for delivered orders
            foreach (var item in order.OrderDetails)
            {
                await UpdateVariantStockAsync(item.VariantId, item.Quantity, 0, session);
            }
        }
        else if (oldStatus == OrderStatus.Cancelled && newStatus != OrderStatus.Cancelled)
        {
            // If reactivating a cancelled order, decrease stock again
            foreach (var item in order.OrderDetails)
            {
                await UpdateVariantStockAsync(item.VariantId, 0, -item.Quantity, session);
            }
        }
    }

    private async Task UpdateVariantStockAsync(string variantId, int soldQuantityChange, int stockQuantityChange, IClientSessionHandle session)
    {
        // Get the variant information
        var variant = await _productVariantService.GetVariantByIdAsync(variantId);

        if (variant != null)
        {
            await _productVariantService.UpdateProductStockAsync(variant.ProductId, variant.Id, soldQuantityChange, stockQuantityChange);
        }
    }

    private FilterDefinition<Order> BuildAdminOrderFilter(OrderFilterDto request)
    {
        var filters = new List<FilterDefinition<Order>>();

        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchFilter = Builders<Order>.Filter.Or(
                Builders<Order>.Filter.Regex(x => x.Status, new MongoDB.Bson.BsonRegularExpression(request.Search, "i")),
                Builders<Order>.Filter.Regex(x => x.PaymentType, new MongoDB.Bson.BsonRegularExpression(request.Search, "i")),
                Builders<Order>.Filter.Regex(x => x.Address, new MongoDB.Bson.BsonRegularExpression(request.Search, "i"))
            );
            filters.Add(searchFilter);
        }

        if (!string.IsNullOrEmpty(request.Status))
        {
            filters.Add(Builders<Order>.Filter.Eq(x => x.Status, request.Status));
        }

        if (!string.IsNullOrEmpty(request.PaymentType))
        {
            filters.Add(Builders<Order>.Filter.Eq(x => x.PaymentType, request.PaymentType));
        }

        if (!string.IsNullOrEmpty(request.UserId))
        {
            filters.Add(Builders<Order>.Filter.Eq(x => x.UserId, request.UserId));
        }

        if (request.StartDate.HasValue)
        {
            filters.Add(Builders<Order>.Filter.Gte(x => x.CreatedAt, request.StartDate.Value));
        }

        if (request.EndDate.HasValue)
        {
            filters.Add(Builders<Order>.Filter.Lte(x => x.CreatedAt, request.EndDate.Value));
        }

        if (request.MinAmount.HasValue)
        {
            filters.Add(Builders<Order>.Filter.Gte(x => x.TotalPrice, request.MinAmount.Value));
        }

        if (request.MaxAmount.HasValue)
        {
            filters.Add(Builders<Order>.Filter.Lte(x => x.TotalPrice, request.MaxAmount.Value));
        }

        return filters.Count > 0 ? Builders<Order>.Filter.And(filters) : Builders<Order>.Filter.Empty;
    }

    private SortDefinition<Order> BuildSortDefinition(PaginationRequest request)
    {
        var sortBuilder = Builders<Order>.Sort;
        var isDescending = request.SortOrder?.ToLower() == "desc";

        return request.SortBy?.ToLower() switch
        {
            "total_price" => isDescending ? sortBuilder.Descending(x => x.TotalPrice) : sortBuilder.Ascending(x => x.TotalPrice),
            "status" => isDescending ? sortBuilder.Descending(x => x.Status) : sortBuilder.Ascending(x => x.Status),
            "updated_at" => isDescending ? sortBuilder.Descending(x => x.UpdatedAt) : sortBuilder.Ascending(x => x.UpdatedAt),
            _ => isDescending ? sortBuilder.Descending(x => x.CreatedAt) : sortBuilder.Ascending(x => x.CreatedAt)
        };
    }

    private async Task<OrderDto> MapToOrderDtoAsync(Order order)
    {
        var user = await _users.Find(x => x.Id == order.UserId).FirstOrDefaultAsync();
        var voucher = !string.IsNullOrEmpty(order.VoucherId)
            ? await _vouchers.Find(x => x.Id == order.VoucherId).FirstOrDefaultAsync()
            : null;

        var items = new List<OrderItemDto>();
        foreach (var detail in order.OrderDetails)
        {
            var product = await _products.Find(x => x.Id == detail.ProductId).FirstOrDefaultAsync();
            if (product != null)
            {
                items.Add(new OrderItemDto
                {
                    ProductId = detail.ProductId,
                    VariantId = detail.VariantId,
                    ProductName = product.Name,
                    ProductThumbnail = product.Thumbnail,
                    Price = detail.Price,
                    Quantity = detail.Quantity,
                    Total = detail.Total,
                    Deadline = detail.Deadline
                });
            }
        }

        return new OrderDto
        {
            Id = order.Id!,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            VoucherId = order.VoucherId,
            VoucherName = voucher?.Name,
            VoucherDiscount = voucher?.Discount ?? 0,
            PaymentType = order.PaymentType,
            Address = order.Address,
            UserId = order.UserId,
            UserName = user?.FullName,
            Items = items,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };
    }

    private async Task<AdminOrderDto> MapToAdminOrderDtoAsync(Order order)
    {
        var user = await _users.Find(x => x.Id == order.UserId).FirstOrDefaultAsync();
        var voucher = !string.IsNullOrEmpty(order.VoucherId)
            ? await _vouchers.Find(x => x.Id == order.VoucherId).FirstOrDefaultAsync()
            : null;

        var items = new List<AdminOrderItemDto>();
        foreach (var detail in order.OrderDetails)
        {
            var product = await _products.Find(x => x.Id == detail.ProductId).FirstOrDefaultAsync();
            if (product != null)
            {
                var variant = await _productVariantService.GetVariantByIdAsync(detail.VariantId);
                var currentStock = variant?.StockQuantity ?? 0;
                items.Add(new AdminOrderItemDto
                {
                    ProductId = detail.ProductId,
                    VariantId = detail.VariantId,
                    ProductName = product.Name,
                    ProductThumbnail = product.Thumbnail,
                    ProductSlug = product.Slug,
                    Price = detail.Price,
                    Quantity = detail.Quantity,
                    Total = detail.Total,
                    Deadline = detail.Deadline,
                    StockAfterOrder = currentStock
                });
            }
        }

        return new AdminOrderDto
        {
            Id = order.Id!,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            VoucherId = order.VoucherId,
            VoucherName = voucher?.Name,
            VoucherDiscount = voucher?.Discount ?? 0,
            PaymentType = order.PaymentType,
            Address = order.Address,
            UserId = order.UserId,
            UserName = user?.FullName ?? "Unknown User",
            UserPhone = user?.Phone,
            Items = items,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };
    }
}