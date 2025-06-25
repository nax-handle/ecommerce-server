using System.ComponentModel.DataAnnotations;

namespace Toxos_V2.Dtos;

public class CreateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; set; }
}

public class UpdateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public required string Name { get; set; }
}

public class CategoryDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CategoryListDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
}