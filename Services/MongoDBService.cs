using MongoDB.Driver;
using Microsoft.Extensions.Options;
using Toxos_V2.Models;

namespace Toxos_V2.Services;

public class MongoDBService
{
    private readonly IMongoDatabase _database;

    public MongoDBService(IOptions<MongoDBSettings> mongoDBSettings)
    {
        var mongoClient = new MongoClient(mongoDBSettings.Value.ConnectionString);
        _database = mongoClient.GetDatabase(mongoDBSettings.Value.DatabaseName);
    }

    public IMongoDatabase Database => _database;

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
} 