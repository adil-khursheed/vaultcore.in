import { randomBytes } from "node:crypto";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq, gt } from "@repo/db";
import { db } from "@repo/db/client";
import { user, verification, VerifyNewUserEmailSchema } from "@repo/db/schema";
import { queueJob } from "@repo/jobs";

import { publicProcedure } from "../trpc";

export const authRouter = {
  sendVerificationEmail: publicProcedure
    .input(VerifyNewUserEmailSchema)
    .mutation(async ({ input }) => {
      const email = input.email;
      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required.",
        });
      }

      // Basic Rate Limiting: Check if a verification email was sent in the last 60 seconds
      const recentVerification = await db.query.verification.findFirst({
        where: and(
          eq(verification.identifier, email),
          gt(verification.createdAt, new Date(Date.now() - 60000)),
        ),
      });

      if (recentVerification) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Please wait a minute before requesting another verification email.",
        });
      }

      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this email already exists.",
        });
      }

      // Generate a secure random token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Store in database
      await db.insert(verification).values({
        id: randomBytes(16).toString("hex"),
        identifier: email,
        value: token,
        expiresAt,
      });

      await queueJob("SEND_EMAIL", {
        to: email,
        subject: "Email Verification",
        props: {
          type: "emailVerification",
          actionUrl: `${process.env.WEB_APP_URL}/verify?token=${token}`,
        },
      });

      return { email };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { token } = input;

      // Find and validate the token in the database
      const record = await db.query.verification.findFirst({
        where: and(
          eq(verification.value, token),
          gt(verification.expiresAt, new Date()),
        ),
      });

      if (!record) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification token.",
        });
      }

      return { email: record.identifier };
    }),
} satisfies TRPCRouterRecord;
