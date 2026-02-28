import { Queue } from "bullmq";

import type { JobDataMap, JobName } from "./registry";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Shared connection options for BullMQ.
 */
export const connection = {
  url: REDIS_URL,
};

/**
 * The main queue instance.
 */
export const mainQueue = new Queue("main-queue", {
  connection: {
    url: REDIS_URL,
  },
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

/**
 * Type-safe helper to add a job to the queue.
 */
export async function queueJob<T extends JobName>(
  name: T,
  data: JobDataMap[T],
) {
  return mainQueue.add(name, data);
}

export * from "./registry";
