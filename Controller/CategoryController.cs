using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Toxos_V2.Services;
using Toxos_V2.Middlewares;
using Toxos_V2.Dtos;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoryController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // GET endpoints - accessible by users and admins
    [HttpGet]
    [SwaggerOperation(
        Summary = "Get all categories",
        Description = "Retrieves a simplified list of all categories for users. Requires authentication.",
        OperationId = "GetCategories"
    )]
    [SwaggerResponse(200, "Categories retrieved successfully", typeof(List<CategoryListDto>))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<List<CategoryListDto>>> GetCategories()
    {
        try
        {
            var categories = await _categoryService.GetCategoriesForUserAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving categories", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Get category by ID",
        Description = "Retrieves a specific category by its ID. Requires authentication.",
        OperationId = "GetCategoryById"
    )]
    [SwaggerResponse(200, "Category retrieved successfully", typeof(CategoryDto))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(404, "Category not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<CategoryDto>> GetCategoryById(string id)
    {
        try
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            return Ok(category);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the category", error = ex.Message });
        }
    }

    // Admin-only endpoints for CRUD operations
    [HttpGet("admin/all")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Get all categories (Admin)",
        Description = "Retrieves detailed list of all categories for admin. Requires admin privileges.",
        OperationId = "GetAllCategoriesAdmin"
    )]
    [SwaggerResponse(200, "Categories retrieved successfully", typeof(List<CategoryDto>))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<List<CategoryDto>>> GetAllCategoriesAdmin()
    {
        try
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving categories", error = ex.Message });
        }
    }

    [HttpPost]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Create category",
        Description = "Creates a new category. Requires admin privileges.",
        OperationId = "CreateCategory"
    )]
    [SwaggerResponse(201, "Category created successfully", typeof(CategoryDto))]
    [SwaggerResponse(400, "Bad request - Invalid data or category already exists", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto createCategoryDto)
    {
        try
        {
            var category = await _categoryService.CreateCategoryAsync(createCategoryDto);
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the category", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Update category",
        Description = "Updates an existing category. Requires admin privileges.",
        OperationId = "UpdateCategory"
    )]
    [SwaggerResponse(200, "Category updated successfully", typeof(CategoryDto))]
    [SwaggerResponse(400, "Bad request - Invalid data or category name already exists", typeof(object))]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Category not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(string id, UpdateCategoryDto updateCategoryDto)
    {
        try
        {
            var category = await _categoryService.UpdateCategoryAsync(id, updateCategoryDto);
            
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            return Ok(category);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the category", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [RequireAdmin]
    [SwaggerOperation(
        Summary = "Delete category",
        Description = "Deletes an existing category. Requires admin privileges.",
        OperationId = "DeleteCategory"
    )]
    [SwaggerResponse(204, "Category deleted successfully")]
    [SwaggerResponse(401, "Unauthorized - Authentication required", typeof(object))]
    [SwaggerResponse(403, "Forbidden - Admin privileges required", typeof(object))]
    [SwaggerResponse(404, "Category not found", typeof(object))]
    [SwaggerResponse(500, "Internal server error", typeof(object))]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        try
        {
            var deleted = await _categoryService.DeleteCategoryAsync(id);
            
            if (!deleted)
            {
                return NotFound(new { message = "Category not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the category", error = ex.Message });
        }
    }
} 