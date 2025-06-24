using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;
using Toxos_V2.Models;

namespace Toxos_V2.Services;

public class CloudinaryFileUploadService
{
    private readonly Cloudinary _cloudinary;
    private readonly List<string> _allowedExtensions = new() { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB for Cloudinary

    public CloudinaryFileUploadService(IOptions<CloudinarySettings> cloudinarySettings)
    {
        var settings = cloudinarySettings.Value;
        
        if (string.IsNullOrEmpty(settings.CloudName) || 
            string.IsNullOrEmpty(settings.ApiKey) || 
            string.IsNullOrEmpty(settings.ApiSecret))
        {
            throw new InvalidOperationException("Cloudinary settings are not properly configured");
        }

        var account = new Account(
            settings.CloudName,
            settings.ApiKey,
            settings.ApiSecret
        );

        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true; // Use HTTPS URLs
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder = "products")
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or null");
        }

        // Validate file size
        if (file.Length > _maxFileSize)
        {
            throw new ArgumentException($"File size exceeds maximum allowed size of {_maxFileSize / (1024 * 1024)}MB");
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type {extension} is not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");
        }

        // Generate unique public ID
        var publicId = $"{folder}/{Guid.NewGuid()}";

        try
        {
            using var stream = file.OpenReadStream();
            
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                PublicId = publicId,
                Folder = folder,
                Transformation = new Transformation()
                    .Quality("auto") // Auto optimize quality
                    .FetchFormat("auto"), // Auto format (WebP when supported)
                Overwrite = true
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to upload file to Cloudinary: {ex.Message}", ex);
        }
    }

    public async Task<List<string>> UploadMultipleFilesAsync(List<IFormFile> files, string folder = "products")
    {
        var uploadedFiles = new List<string>();
        var uploadTasks = new List<Task<string>>();

        // Upload files in parallel for better performance
        foreach (var file in files)
        {
            if (file != null && file.Length > 0)
            {
                uploadTasks.Add(UploadFileAsync(file, folder));
            }
        }

        try
        {
            var results = await Task.WhenAll(uploadTasks);
            uploadedFiles.AddRange(results);
        }
        catch (Exception)
        {
            // If any upload fails, clean up successfully uploaded files
            foreach (var uploadedUrl in uploadedFiles)
            {
                await DeleteFileAsync(uploadedUrl);
            }
            throw;
        }

        return uploadedFiles;
    }

    public async Task<bool> DeleteFileAsync(string imageUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(imageUrl))
                return false;

            // Extract public ID from Cloudinary URL
            var publicId = ExtractPublicIdFromUrl(imageUrl);
            if (string.IsNullOrEmpty(publicId))
                return false;

            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Image
            };

            var result = await _cloudinary.DestroyAsync(deletionParams);
            return result.Result == "ok";
        }
        catch
        {
            return false;
        }
    }

    public async Task DeleteMultipleFilesAsync(List<string> imageUrls)
    {
        var deletionTasks = imageUrls
            .Where(url => !string.IsNullOrEmpty(url))
            .Select(DeleteFileAsync);

        await Task.WhenAll(deletionTasks);
    }

    public async Task<string> UploadThumbnailAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("Thumbnail file is empty or null");
        }

        try
        {
            using var stream = file.OpenReadStream();
            
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                PublicId = $"products/thumbnails/{Guid.NewGuid()}",
                Folder = "products/thumbnails",
                Transformation = new Transformation()
                    .Width(400)
                    .Height(400)
                    .Crop("fill")
                    .Quality("auto")
                    .FetchFormat("auto"),
                Overwrite = true
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Thumbnail upload failed: {uploadResult.Error.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to upload thumbnail to Cloudinary: {ex.Message}", ex);
        }
    }

    public async Task<List<string>> UploadProductImagesAsync(List<IFormFile> files)
    {
        var uploadedImages = new List<string>();
        var uploadTasks = new List<Task<string>>();

        foreach (var file in files)
        {
            if (file != null && file.Length > 0)
            {
                uploadTasks.Add(UploadProductImageAsync(file));
            }
        }

        try
        {
            var results = await Task.WhenAll(uploadTasks);
            uploadedImages.AddRange(results);
        }
        catch (Exception)
        {
            // Clean up on failure
            foreach (var uploadedUrl in uploadedImages)
            {
                await DeleteFileAsync(uploadedUrl);
            }
            throw;
        }

        return uploadedImages;
    }

    private async Task<string> UploadProductImageAsync(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        
        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(file.FileName, stream),
            PublicId = $"products/images/{Guid.NewGuid()}",
            Folder = "products/images",
            Transformation = new Transformation()
                .Width(800)
                .Height(600)
                .Crop("fill")
                .Quality("auto")
                .FetchFormat("auto"),
            Overwrite = true
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new Exception($"Product image upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    private string ExtractPublicIdFromUrl(string imageUrl)
    {
        try
        {
            // Extract public ID from Cloudinary URL
            // Example: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/products/abc123.jpg
            var uri = new Uri(imageUrl);
            var pathSegments = uri.AbsolutePath.Split('/');
            
            // Find the upload segment
            var uploadIndex = Array.IndexOf(pathSegments, "upload");
            if (uploadIndex == -1 || uploadIndex + 2 >= pathSegments.Length)
                return string.Empty;

            // Skip version if present (starts with 'v' followed by numbers)
            var startIndex = uploadIndex + 1;
            if (pathSegments[startIndex].StartsWith("v") && pathSegments[startIndex].Length > 1)
            {
                startIndex++;
            }

            // Combine remaining segments and remove file extension
            var publicIdParts = pathSegments.Skip(startIndex).ToArray();
            var publicId = string.Join("/", publicIdParts);
            
            // Remove file extension
            var lastDotIndex = publicId.LastIndexOf('.');
            if (lastDotIndex > 0)
            {
                publicId = publicId.Substring(0, lastDotIndex);
            }

            return publicId;
        }
        catch
        {
            return string.Empty;
        }
    }

    public static string GenerateSlug(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        // Convert to lowercase
        string slug = input.ToLowerInvariant();

        // Replace spaces and special characters with hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");

        // Remove leading and trailing hyphens
        slug = slug.Trim('-');

        return slug;
    }
} 