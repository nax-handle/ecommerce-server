# Cloudinary Setup Guide

This guide explains how to set up Cloudinary for file uploads in the Toxos API.

## Getting Started with Cloudinary

1. **Create a free Cloudinary account** at [cloudinary.com](https://cloudinary.com)
2. **Get your credentials** from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Configuration

### Development Environment

Update `appsettings.Development.json`:

```json
{
  "Cloudinary": {
    "CloudName": "your-actual-cloud-name",
    "ApiKey": "your-actual-api-key",
    "ApiSecret": "your-actual-api-secret"
  }
}
```

### Production Environment

Set environment variables or update `appsettings.json`:

```json
{
  "Cloudinary": {
    "CloudName": "${CLOUDINARY_CLOUD_NAME}",
    "ApiKey": "${CLOUDINARY_API_KEY}",
    "ApiSecret": "${CLOUDINARY_API_SECRET}"
  }
}
```

## Features

### Automatic Image Optimization

- **Auto quality** - Automatically optimizes image quality
- **Auto format** - Serves WebP when supported, falls back to original format
- **Responsive images** - Different sizes for thumbnails and gallery images

### Image Transformations

- **Thumbnails**: 400x400px, cropped to fill
- **Product Images**: 800x600px, cropped to fill
- **Quality optimization** for faster loading

### Upload Organization

```
cloudinary/
└── products/
    ├── thumbnails/    # 400x400 product thumbnails
    └── images/        # 800x600 product gallery images
```

## Security Features

- **File type validation** - Only allows image files (.jpg, .jpeg, .png, .webp, .gif)
- **File size limits** - 10MB maximum per file
- **Secure URLs** - All uploaded files use HTTPS
- **Automatic cleanup** - Old files are deleted when updated/removed

## API Usage

### Creating Product with Images

```http
POST /api/Product
Content-Type: multipart/form-data

Form Data:
- Name: "Gaming Laptop"
- ThumbnailFile: [laptop-thumb.jpg]
- ImageFiles: [laptop-1.jpg, laptop-2.jpg]
- CategoryId: "507f1f77bcf86cd799439011"
```

### Response Example

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Gaming Laptop",
  "slug": "gaming-laptop",
  "thumbnail": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/thumbnails/abc123.jpg",
  "images": [
    {
      "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/def456.jpg"
    },
    {
      "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/images/ghi789.jpg"
    }
  ]
}
```

## Benefits

- **CDN delivery** - Global content delivery network
- **Automatic backups** - Your images are safely stored
- **Scalability** - Handles any amount of traffic
- **Performance** - Optimized images for faster loading
- **Mobile-friendly** - Responsive image delivery

## Testing

To test file uploads:

1. Set up your Cloudinary credentials
2. Use Swagger UI at `/swagger`
3. Try the "Create Product" endpoint with file uploads
4. Check your Cloudinary dashboard to see uploaded files

## Error Handling

Common errors and solutions:

- **"Cloudinary settings are not properly configured"** - Check your credentials
- **"File size exceeds maximum"** - Reduce file size to under 10MB
- **"File type not allowed"** - Only use image files (jpg, png, gif, webp)
- **"Upload failed"** - Check your API limits and internet connection
