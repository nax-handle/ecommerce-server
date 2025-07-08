using MongoDB.Driver;
using Toxos_V2.Models;
using Toxos_V2.Dtos;

namespace Toxos_V2.Services;

public class CategoryService
{
    private readonly IMongoCollection<Category> _categories;
    private readonly CloudinaryFileUploadService _fileUploadService;

    public CategoryService(MongoDBService mongoDBService, CloudinaryFileUploadService fileUploadService)
    {
        _categories = mongoDBService.GetCollection<Category>("categories");
        _fileUploadService = fileUploadService;
    }

    public async Task<List<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _categories.Find(_ => true).ToListAsync();
        return categories.Select(MapToCategoryDto).ToList();
    }

    public async Task<List<CategoryListDto>> GetCategoriesForUserAsync()
    {
        var categories = await _categories.Find(_ => true).ToListAsync();
        return categories.Select(c => new CategoryListDto
        {
            Id = c.Id!,
            Name = c.Name
        }).ToList();
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(string id)
    {
        var category = await _categories.Find(x => x.Id == id).FirstOrDefaultAsync();
        return category != null ? MapToCategoryDto(category) : null;
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
    {
        // Check if category with same name already exists
        var existingCategory = await _categories.Find(x => x.Name.ToLower() == createCategoryDto.Name.ToLower()).FirstOrDefaultAsync();
        if (existingCategory != null)
        {
            throw new ArgumentException("Category with this name already exists");
        }
        var imagePaths = "";
        if (createCategoryDto.ThumbnailFile != null)
        {
            imagePaths = await _fileUploadService.UploadThumbnailAsync(createCategoryDto.ThumbnailFile);
        }
        var category = new Category
        {
            Name = createCategoryDto.Name,
            Image = imagePaths,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _categories.InsertOneAsync(category);
        return MapToCategoryDto(category);
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(string id, UpdateCategoryDto updateCategoryDto)
    {
        // Check if another category with same name exists
        var existingCategory = await _categories.Find(x => x.Name.ToLower() == updateCategoryDto.Name.ToLower() && x.Id != id).FirstOrDefaultAsync();
        if (existingCategory != null)
        {
            throw new ArgumentException("Category with this name already exists");
        }

        var updateDefinition = Builders<Category>.Update
            .Set(x => x.Name, updateCategoryDto.Name)
            .Set(x => x.UpdatedAt, DateTime.UtcNow);

        var result = await _categories.UpdateOneAsync(x => x.Id == id, updateDefinition);

        if (result.MatchedCount == 0)
        {
            return null;
        }

        var updatedCategory = await _categories.Find(x => x.Id == id).FirstOrDefaultAsync();
        return updatedCategory != null ? MapToCategoryDto(updatedCategory) : null;
    }

    public async Task<bool> DeleteCategoryAsync(string id)
    {
        var result = await _categories.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> CategoryExistsAsync(string id)
    {
        var count = await _categories.CountDocumentsAsync(x => x.Id == id);
        return count > 0;
    }

    private static CategoryDto MapToCategoryDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id!,
            Name = category.Name,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}