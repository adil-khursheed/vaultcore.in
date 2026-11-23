import type { Job } from "bullmq";
import { Worker } from "bullmq";

import { resend, sendEmail } from "@repo/email";
import { and, eq, lt } from "@repo/db";
import { db } from "@repo/db/client";
import { credential } from "@repo/db/schema";

import type { JobDataMap, JobName } from "./registry.ts";
import { connection, getMainQueue } from "./index.ts";
import { JobNames } from "./registry.ts";

/**
 * Define handlers for each job type.
 */
const jobHandlers: {
  [K in JobName]: (data: JobDataMap[K], job: Job) => Promise<any>;
} = {
  [JobNames.SEND_EMAIL]: async (data) => {
    console.log(`[Worker] Sending email to ${data.to}...`);

    // If it's a template-based email (using our internal helper)
    if ("props" in data && data.props) {
      return await sendEmail({
        to: (Array.isArray(data.to) ? data.to[0] : data.to) as string,
        subject: data.subject,
        props: data.props as any,
      });
    }

    // Fallback to raw resend call if provided
    return await resend.emails.send({
      from: "onboarding@resend.dev",
      to: data.to as any, // Resend accepts string or array
      subject: data.subject,
      text: data.text ?? undefined,
      html: data.html ?? undefined,
    } as any);
  },
  [JobNames.PURGE_TRASH]: async (data) => {
    const retentionDays = data.retentionDays ?? 30;
    const cutoff = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000,
    );

    const deleted = await db
      .delete(credential)
      .where(
        and(
          eq(credential.isDeleted, true),
          lt(credential.updatedAt, cutoff),
        ),
      )
      .returning({ id: credential.id });

    console.log(
      `[Worker] Purged ${deleted.length} trashed credentials older than ${retentionDays} days`,
    );

    return { deletedCount: deleted.length };
  },
};

/**
 * Initialize the worker.
 */
export const mainWorker = new Worker(
  "main-queue",
  async (job: Job) => {
    const handler = jobHandlers[job.name as JobName];
    if (handler) {
      return handler(job.data, job);
    }
    console.warn(`[Worker] No handler found for job: ${job.name}`);
  },
  {
    connection,
    concurrency: 5,
  },
);

mainWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} (type: ${job.name}) completed!`);
});

mainWorker.on("failed", (job, err) => {
  console.error(
    `[Worker] Job ${job?.id} (type: ${job?.name}) failed: ${err.message}`,
  );
});

console.log("[Worker] Started and listening for jobs...");

// Keep the trash from growing forever: purge items that have been deleted for
// longer than the retention window. BullMQ de-duplicates the repeatable job.
void getMainQueue()
  .add(
    JobNames.PURGE_TRASH,
    { retentionDays: 30 },
    {
      repeat: { pattern: "0 3 * * *" },
      jobId: "purge-trash-daily",
    },
  )
  .catch((error: unknown) => {
    console.error("[Worker] Failed to schedule trash purge job", error);
  });
