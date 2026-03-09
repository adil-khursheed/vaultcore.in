import { Queue } from "bullmq";

import type { JobDataMap, JobName } from "./registry";

/**
 * Shared connection options for BullMQ.
 * Prefers REDIS_URL, then falls back to individual variables (standard on Railway).
 */
export const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDISHOST || "localhost",
      port: parseInt(process.env.REDISPORT || "6379"),
      password: process.env.REDISPASSWORD || process.env.REDIS_PASSWORD,
      username: process.env.REDISUSER || "default",
    };

let _mainQueue: Queue | undefined;

/**
 * Gets the main queue instance, initializing it if necessary.
 */
export function getMainQueue() {
  if (!_mainQueue) {
    _mainQueue = new Queue("main-queue", {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 1000,
      },
    });
  }
  return _mainQueue;
}

/**
 * Type-safe helper to add a job to the queue.
 */
export async function queueJob<T extends JobName>(
  name: T,
  data: JobDataMap[T],
) {
  return getMainQueue().add(name, data);
}

export * from "./registry";
