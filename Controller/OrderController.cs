using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Services;
using Toxos_V2.Dtos;
using Toxos_V2.Middlewares;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
[SwaggerTag("Order management - User orders and admin order management")]
public class OrderController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrderController(OrderService orderService)
    {
        _orderService = orderService;
    }

    // User endpoints
    [HttpPost]
    [RequireUser]
    [SwaggerOperation(Summary = "Create new order", Description = "Create a new order with stock validation and automatic voucher application - Checkout")]
    [SwaggerResponse(201, "Order created successfully", typeof(OrderCreationResponseDto))]
    [SwaggerResponse(400, "Invalid order data or insufficient stock")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(404, "Product or voucher not found")]
    public async Task<ActionResult<OrderCreationResponseDto>> CreateOrder([FromBody] CreateOrderDto createOrderDto)
    {
        try
        {
            var userId = HttpContext.GetCurrentUserId();
            var result = await _orderService.CreateOrderAsync(userId, createOrderDto);
            return CreatedAtAction(nameof(GetOrderById), new { id = result.OrderId }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the order", error = ex.Message });
        }
    }

    [HttpGet]
    [RequireUser]
    [SwaggerOperation(Summary = "Get user orders", Description = "Get paginated list of current user's orders")]
    [SwaggerResponse(200, "Orders retrieved successfully", typeof(PaginatedResponse<UserOrderDto>))]
    [SwaggerResponse(401, "User not authenticated")]
    public async Task<ActionResult<PaginatedResponse<UserOrderDto>>> GetUserOrders([FromQuery] PaginationRequest request)
    {
        try
        {
            var userId = HttpContext.GetCurrentUserId();
            var result = await _orderService.GetUserOrdersAsync(userId, request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving orders", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [RequireUser]
    [SwaggerOperation(Summary = "Get order by ID", Description = "Get detailed information about a specific order (only user's own orders)")]
    [SwaggerResponse(200, "Order found", typeof(OrderDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(404, "Order not found or access denied")]
    public async Task<ActionResult<OrderDto>> GetOrderById(string id)
    {
        try
        {
            var userId = HttpContext.GetCurrentUserId();
            var order = await _orderService.GetUserOrderByIdAsync(userId, id);
            
            if (order == null)
                return NotFound(new { message = "Order not found" });
            
            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the order", error = ex.Message });
        }
    }

    // Admin endpoints
    [HttpGet("admin/all")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get all orders (Admin)", Description = "Get paginated list of all orders with advanced filtering options")]
    [SwaggerResponse(200, "Orders retrieved successfully", typeof(PaginatedResponse<AdminOrderDto>))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    public async Task<ActionResult<PaginatedResponse<AdminOrderDto>>> GetAllOrdersForAdmin([FromQuery] OrderFilterDto request)
    {
        try
        {
            var result = await _orderService.GetOrdersForAdminAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving orders", error = ex.Message });
        }
    }

    [HttpGet("admin/{id}")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get order by ID (Admin)", Description = "Get detailed information about any order with admin-level details")]
    [SwaggerResponse(200, "Order found", typeof(AdminOrderDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "Order not found")]
    public async Task<ActionResult<AdminOrderDto>> GetOrderByIdForAdmin(string id)
    {
        try
        {
            var order = await _orderService.GetOrderByIdForAdminAsync(id);
            
            if (order == null)
                return NotFound(new { message = "Order not found" });
            
            return Ok(order);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the order", error = ex.Message });
        }
    }

    [HttpPut("admin/{id}/status")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Update order status (Admin)", Description = "Update order status with automatic stock management")]
    [SwaggerResponse(200, "Order status updated successfully", typeof(AdminOrderDto))]
    [SwaggerResponse(400, "Invalid status or order data")]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    [SwaggerResponse(404, "Order not found")]
    public async Task<ActionResult<AdminOrderDto>> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusDto updateDto)
    {
        try
        {
            // Validate status
            var validStatuses = new[] { 
                OrderStatus.Pending, 
                OrderStatus.Confirmed, 
                OrderStatus.Processing, 
                OrderStatus.Shipped, 
                OrderStatus.Delivered, 
                OrderStatus.Cancelled, 
                OrderStatus.Refunded 
            };
            
            if (!validStatuses.Contains(updateDto.Status))
            {
                return BadRequest(new { message = "Invalid status value", validStatuses });
            }

            var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, updateDto);
            
            if (updatedOrder == null)
                return NotFound(new { message = "Order not found" });
            
            return Ok(updatedOrder);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the order", error = ex.Message });
        }
    }

    [HttpGet("admin/stats")]
    [RequireAdmin]
    [SwaggerOperation(Summary = "Get order statistics (Admin)", Description = "Get comprehensive order and revenue statistics")]
    [SwaggerResponse(200, "Statistics retrieved successfully", typeof(OrderStatsDto))]
    [SwaggerResponse(401, "User not authenticated")]
    [SwaggerResponse(403, "Admin access required")]
    public async Task<ActionResult<OrderStatsDto>> GetOrderStats()
    {
        try
        {
            var stats = await _orderService.GetOrderStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving statistics", error = ex.Message });
        }
    }

    // Helper endpoint for order statuses
    [HttpGet("statuses")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Get available order statuses", Description = "Get list of all available order statuses for frontend reference")]
    [SwaggerResponse(200, "Order statuses retrieved successfully")]
    public ActionResult<object> GetOrderStatuses()
    {
        var statuses = new
        {
            statuses = new[]
            {
                new { value = OrderStatus.Pending, label = "Pending", description = "Order has been placed and is awaiting confirmation" },
                new { value = OrderStatus.Confirmed, label = "Confirmed", description = "Order has been confirmed and is being prepared" },
                new { value = OrderStatus.Processing, label = "Processing", description = "Order is being processed and prepared for shipment" },
                new { value = OrderStatus.Shipped, label = "Shipped", description = "Order has been shipped and is on the way" },
                new { value = OrderStatus.Delivered, label = "Delivered", description = "Order has been successfully delivered" },
                new { value = OrderStatus.Cancelled, label = "Cancelled", description = "Order has been cancelled" },
                new { value = OrderStatus.Refunded, label = "Refunded", description = "Order has been refunded" }
            }
        };
        
        return Ok(statuses);
    }

    // Helper endpoint for payment types
    [HttpGet("payment-types")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Get available payment types", Description = "Get list of all available payment types for frontend reference")]
    [SwaggerResponse(200, "Payment types retrieved successfully")]
    public ActionResult<object> GetPaymentTypes()
    {
        var paymentTypes = new
        {
            paymentTypes = new[]
            {
                new { value = PaymentType.Cash, label = "Cash on Delivery", description = "Pay when the order is delivered" },
                new { value = PaymentType.CreditCard, label = "Credit Card", description = "Pay with credit or debit card" },
                new { value = PaymentType.BankTransfer, label = "Bank Transfer", description = "Pay via bank transfer" },
                new { value = PaymentType.DigitalWallet, label = "Digital Wallet", description = "Pay with digital wallet (PayPal, etc.)" }
            }
        };
        
        return Ok(paymentTypes);
    }
} 