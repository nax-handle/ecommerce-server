using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using Toxos_V2.Dtos;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
public class VoucherController : ControllerBase
{
    private readonly VoucherService _voucherService;

    public VoucherController(VoucherService voucherService)
    {
        _voucherService = voucherService;
    }

    [HttpGet("{id}")]
    [RequireUser]
    [SwaggerOperation(
        Summary = "Get voucher details by ID",
        Description = "Retrieves detailed information about a specific voucher. Requires authentication.",
        OperationId = "GetVoucherById"
    )]
    [SwaggerResponse(200, "Voucher retrieved successfully", typeof(VoucherDetailDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(404, "Voucher not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<VoucherDetailDto>> GetVoucherById(string id)
    {
        try
        {
            var voucher = await _voucherService.GetVoucherDetailForUserAsync(id);
            
            if (voucher == null)
            {
                return NotFound(new { message = "Voucher not found" });
            }

            return Ok(voucher);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the voucher", error = ex.Message });
        }
    }

    [HttpPost("apply")]
    [RequireUser]
    [SwaggerOperation(
        Summary = "Apply voucher to order",
        Description = "Applies a voucher to an order and calculates the discount. Validates voucher eligibility and minimum order value. Requires authentication.",
        OperationId = "ApplyVoucher"
    )]
    [SwaggerResponse(200, "Voucher application result", typeof(VoucherApplicationResultDto))]
    [SwaggerResponse(400, "Bad request - Invalid data", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<VoucherApplicationResultDto>> ApplyVoucher([FromBody] ApplyVoucherDto applyVoucherDto)
    {
        try
        {
            var result = await _voucherService.ApplyVoucherAsync(applyVoucherDto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while applying the voucher", error = ex.Message });
        }
    }

    // Admin endpoints - require admin privileges
    [HttpGet("admin/all")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Get paginated vouchers (Admin)",
        Description = "Retrieves a paginated list of all vouchers for admin with complete details and search capabilities. Requires admin privileges.",
        OperationId = "GetVouchersAdmin"
    )]
    [SwaggerResponse(200, "Vouchers retrieved successfully", typeof(PaginatedResponse<VoucherAdminDto>))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<PaginatedResponse<VoucherAdminDto>>> GetVouchersAdmin([FromQuery] PaginationRequest request)
    {
        try
        {
            var vouchers = await _voucherService.GetVouchersForAdminAsync(request);
            return Ok(vouchers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving vouchers", error = ex.Message });
        }
    }

    [HttpGet("admin/{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Get voucher details by ID (Admin)",
        Description = "Retrieves complete voucher information for admin. Requires admin privileges.",
        OperationId = "GetVoucherByIdAdmin"
    )]
    [SwaggerResponse(200, "Voucher retrieved successfully", typeof(VoucherAdminDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Voucher not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<VoucherAdminDto>> GetVoucherByIdAdmin(string id)
    {
        try
        {
            var voucher = await _voucherService.GetVoucherByIdForAdminAsync(id);
            
            if (voucher == null)
            {
                return NotFound(new { message = "Voucher not found" });
            }

            return Ok(voucher);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the voucher", error = ex.Message });
        }
    }

    [HttpPost]
    [RequireAdmin]
    [Consumes("multipart/form-data")]
    [SwaggerOperation(
        Summary = "Create voucher (Admin)",
        Description = "Creates a new voucher with optional image upload. Validates discount type and value. Requires admin privileges.",
        OperationId = "CreateVoucher"
    )]
    [SwaggerResponse(201, "Voucher created successfully", typeof(VoucherAdminDto))]
    [SwaggerResponse(400, "Bad request - Invalid data, invalid discount type/value", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<VoucherAdminDto>> CreateVoucher([FromForm] CreateVoucherDto createVoucherDto)
    {
        try
        {
            var voucher = await _voucherService.CreateVoucherAsync(createVoucherDto);
            return CreatedAtAction(nameof(GetVoucherByIdAdmin), new { id = voucher.Id }, voucher);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the voucher", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [RequireAdmin]
    [Consumes("multipart/form-data")]
    [SwaggerOperation(
        Summary = "Update voucher (Admin)",
        Description = "Updates an existing voucher with optional image upload. Validates discount type and value. Requires admin privileges.",
        OperationId = "UpdateVoucher"
    )]
    [SwaggerResponse(200, "Voucher updated successfully", typeof(VoucherAdminDto))]
    [SwaggerResponse(400, "Bad request - Invalid data, invalid discount type/value", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Voucher not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<VoucherAdminDto>> UpdateVoucher(string id, [FromForm] UpdateVoucherDto updateVoucherDto)
    {
        try
        {
            var voucher = await _voucherService.UpdateVoucherAsync(id, updateVoucherDto);
            
            if (voucher == null)
            {
                return NotFound(new { message = "Voucher not found" });
            }

            return Ok(voucher);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the voucher", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Delete voucher (Admin)",
        Description = "Deletes an existing voucher and all its associated data. Requires admin privileges.",
        OperationId = "DeleteVoucher"
    )]
    [SwaggerResponse(204, "Voucher deleted successfully")]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Voucher not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<IActionResult> DeleteVoucher(string id)
    {
        try
        {
            var deleted = await _voucherService.DeleteVoucherAsync(id);
            
            if (!deleted)
            {
                return NotFound(new { message = "Voucher not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the voucher", error = ex.Message });
        }
    }
} 