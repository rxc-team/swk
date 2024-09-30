import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const REDIS_DEFAULT_HOST = '192.168.1.112';
const REDIS_DEFAULT_PORT = 6379;
const REDIS_DEFAULT_PASSWORD = '';
const REDIS_DEFAULT_DB = 10;

const pubClient = createClient({
  host: process.env.REDIS_HOST || REDIS_DEFAULT_HOST,
  port: Number(process.env.REDIS_PORT) || REDIS_DEFAULT_PORT,
  password: process.env.REDIS_PASSWORD || REDIS_DEFAULT_PASSWORD,
  db: process.env.REDIS_DB || REDIS_DEFAULT_DB,
});

const subClient = pubClient.duplicate();
const redisAdapter = createAdapter(pubClient, subClient);

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}
