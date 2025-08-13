import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Parse Redis URL (format: redis://username:password@host:port/db)
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password,
      username: url.username || undefined,
      db: parseInt(url.pathname.slice(1)) || 0,
      url: redisUrl,
    };
  }

  // Fallback to individual environment variables
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    db: process.env.REDIS_DB || 0,
  };
});
