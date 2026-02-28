import z from "zod";

/**
 * Define your job names here.
 */
export const JobNames = {
  SEND_EMAIL: "SEND_EMAIL",
  // Add more job names as needed
} as const;

export type JobName = keyof typeof JobNames;

/**
 * Define the schemas for each job's data.
 */
export const JobSchemas = {
  [JobNames.SEND_EMAIL]: z.object({
    to: z.union([z.string(), z.array(z.string())]),
    subject: z.string(),
    text: z.string().optional(),
    html: z.string().optional(),
    props: z.record(z.string(), z.any()).optional(), // For @repo/email template props
  }),
};

export type JobDataMap = {
  [K in JobName]: z.infer<(typeof JobSchemas)[K]>;
};

/**
 * Helper to get the schema for a job name.
 */
export function getJobSchema<T extends JobName>(name: T) {
  return JobSchemas[name];
}
