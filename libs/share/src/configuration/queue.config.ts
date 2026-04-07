import { buildRedisConfig } from "./redis.config";

export const buildQueueConfig = () => buildRedisConfig("queue", "QUEUE");
