using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Toxos_V2.Models;
using Toxos_V2.Services;

namespace Toxos_V2.Controller;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IMongoCollection<Product> _products;

    public ProductController(MongoDBService mongoDBService)
    {
        _products = mongoDBService.GetCollection<Product>("products");
    }

    [HttpGet]
    public async Task<ActionResult<List<Product>>> Get()
    {
        var products = await _products.Find(_ => true).ToListAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> Get(string id)
    {
        var product = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();
        
        if (product == null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        await _products.InsertOneAsync(product);
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Product productIn)
    {
        var product = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();

        if (product == null)
        {
            return NotFound();
        }

        productIn.Id = id;
        productIn.UpdatedAt = DateTime.UtcNow;

        await _products.ReplaceOneAsync(x => x.Id == id, productIn);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var product = await _products.Find(x => x.Id == id).FirstOrDefaultAsync();

        if (product == null)
        {
            return NotFound();
        }

        await _products.DeleteOneAsync(x => x.Id == id);

        return NoContent();
    }
} 