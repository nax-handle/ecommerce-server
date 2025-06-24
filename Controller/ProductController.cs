using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using Toxos_V2.Dtos;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly ProductService _productService;

    public ProductController(ProductService productService)
    {
        _productService = productService;
    }

    // User endpoints - accessible by authenticated users
    [HttpGet]
    [SwaggerOperation(
        Summary = "Get paginated products",
        Description = "Retrieves a paginated list of products for users with search and filter capabilities. Requires authentication.",
        OperationId = "GetProducts"
    )]
    [SwaggerResponse(200, "Products retrieved successfully", typeof(PaginatedResponse<ProductListDto>))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<PaginatedResponse<ProductListDto>>> GetProducts([FromQuery] PaginationRequest request)
    {
        try
        {
            var products = await _productService.GetProductsForUserAsync(request);
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving products", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [SwaggerOperation(
        Summary = "Get product details by ID",
        Description = "Retrieves detailed information about a specific product. Automatically increments view count. Requires authentication.",
        OperationId = "GetProductById"
    )]
    [SwaggerResponse(200, "Product retrieved successfully", typeof(ProductDetailDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(404, "Product not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<ProductDetailDto>> GetProductById(string id)
    {
        try
        {
            var product = await _productService.GetProductDetailForUserAsync(id);
            
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the product", error = ex.Message });
        }
    }

    [HttpGet("slug/{slug}")]
    [SwaggerOperation(
        Summary = "Get product details by slug",
        Description = "Retrieves detailed information about a specific product by its slug. Automatically increments view count. Requires authentication.",
        OperationId = "GetProductBySlug"
    )]
    [SwaggerResponse(200, "Product retrieved successfully", typeof(ProductDetailDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(404, "Product not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<ProductDetailDto>> GetProductBySlug(string slug)
    {
        try
        {
            var product = await _productService.GetProductBySlugForUserAsync(slug);
            
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the product", error = ex.Message });
        }
    }

    // Admin endpoints - require admin privileges
    [HttpGet("admin/all")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Get paginated products (Admin)",
        Description = "Retrieves a paginated list of products for admin with complete details and search capabilities. Requires admin privileges.",
        OperationId = "GetProductsAdmin"
    )]
    [SwaggerResponse(200, "Products retrieved successfully", typeof(PaginatedResponse<ProductAdminDto>))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<PaginatedResponse<ProductAdminDto>>> GetProductsAdmin([FromQuery] PaginationRequest request)
    {
        try
        {
            var products = await _productService.GetProductsForAdminAsync(request);
            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving products", error = ex.Message });
        }
    }

    [HttpGet("admin/{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Get product details by ID (Admin)",
        Description = "Retrieves complete product information for admin. Requires admin privileges.",
        OperationId = "GetProductByIdAdmin"
    )]
    [SwaggerResponse(200, "Product retrieved successfully", typeof(ProductAdminDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Product not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<ProductAdminDto>> GetProductByIdAdmin(string id)
    {
        try
        {
            var product = await _productService.GetProductByIdForAdminAsync(id);
            
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the product", error = ex.Message });
        }
    }

    [HttpPost]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Create product",
        Description = "Creates a new product with variants and images. Requires admin privileges.",
        OperationId = "CreateProduct"
    )]
    [SwaggerResponse(201, "Product created successfully", typeof(ProductAdminDto))]
    [SwaggerResponse(400, "Bad request - Invalid data, category doesn't exist, or slug already exists", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<ProductAdminDto>> CreateProduct(CreateProductDto createProductDto)
    {
        try
        {
            var product = await _productService.CreateProductAsync(createProductDto);
            return CreatedAtAction(nameof(GetProductByIdAdmin), new { id = product.Id }, product);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the product", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Update product",
        Description = "Updates an existing product with new information, variants, and images. Requires admin privileges.",
        OperationId = "UpdateProduct"
    )]
    [SwaggerResponse(200, "Product updated successfully", typeof(ProductAdminDto))]
    [SwaggerResponse(400, "Bad request - Invalid data, category doesn't exist, or slug already exists", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Product not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<ProductAdminDto>> UpdateProduct(string id, UpdateProductDto updateProductDto)
    {
        try
        {
            var product = await _productService.UpdateProductAsync(id, updateProductDto);
            
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(product);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the product", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Delete product",
        Description = "Deletes an existing product and all its associated data. Requires admin privileges.",
        OperationId = "DeleteProduct"
    )]
    [SwaggerResponse(204, "Product deleted successfully")]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Product not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<IActionResult> DeleteProduct(string id)
    {
        try
        {
            var deleted = await _productService.DeleteProductAsync(id);
            
            if (!deleted)
            {
                return NotFound(new { message = "Product not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the product", error = ex.Message });
        }
    }
} 