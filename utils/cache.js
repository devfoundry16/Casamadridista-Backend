const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 86400 }); // Default 24h TTL

const getCachedData = async (key, fetchFn, ttl) => {
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await fetchFn();
  cache.set(key, data, ttl);
  return data;
};

const invalidateCache = (key) => cache.del(key);

module.exports = {
  getCachedData,
  invalidateCache,
};
