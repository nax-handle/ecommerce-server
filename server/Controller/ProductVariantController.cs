using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using Toxos_V2.Dtos;
using System.ComponentModel.DataAnnotations;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/productvariant")]
public class ProductVariantController : ControllerBase
{
    private readonly ProductVariantService _productVariantService;

    public ProductVariantController(ProductVariantService productVariantService)
    {
        _productVariantService = productVariantService;
    }

    /// <summary>
    /// Get all variants for a specific product
    /// </summary>
    [HttpGet("{productId}/variants")]
    public async Task<ActionResult<List<ProductVariantDto>>> GetProductVariants(string productId)
    {
        try
        {
            var variants = await _productVariantService.GetVariantsByProductIdAsync(productId);
            return Ok(variants);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific variant by ID
    /// </summary>
    [HttpGet("{variantId}")]
    public async Task<ActionResult<ProductVariantDto>> GetProductVariantById(string variantId)
    {
        try
        {
            var variant = await _productVariantService.GetVariantByIdAsync(variantId);
            if (variant == null)
            {
                return NotFound(new { message = "Product variant not found" });
            }
            return Ok(variant);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new variant for a product
    /// </summary>
    [HttpPost("admin/{productId}/variant")]
    [RequireAdmin]
    public async Task<ActionResult<ProductVariantDto>> CreateProductVariant(string productId, [FromBody] CreateProductVariantDto variantDto)
    {
        try
        {
            var variant = await _productVariantService.CreateVariantAsync(productId, variantDto);
            return CreatedAtAction(nameof(GetProductVariantById), new { variantId = variant.Id }, variant);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the variant", details = ex.Message });
        }
    }

    /// <summary>
    /// Update a specific variant by ID
    /// </summary>
    [HttpPut("admin/{variantId}")]
    [RequireAdmin]
    public async Task<ActionResult<ProductVariantDto>> UpdateProductVariant(string variantId, [FromBody] UpdateProductVariantDto variantDto)
    {
        try
        {
            var variant = await _productVariantService.UpdateVariantAsync(variantId, variantDto);
            if (variant == null)
            {
                return NotFound(new { message = "Product variant not found" });
            }
            return Ok(variant);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the variant", details = ex.Message });
        }
    }

    /// <summary>
    /// Delete a specific variant by ID
    /// </summary>
    [HttpDelete("admin/{variantId}")]
    [RequireAdmin]
    public async Task<IActionResult> DeleteProductVariant(string variantId)
    {
        try
        {
            var deleted = await _productVariantService.DeleteVariantAsync(variantId);
            if (!deleted)
            {
                return NotFound(new { message = "Product variant not found" });
            }
            return Ok(new { message = "Product variant deleted successfully" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the variant", details = ex.Message });
        }
    }
} 