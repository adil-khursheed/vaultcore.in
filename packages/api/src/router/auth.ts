import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

import { VerifyNewUserEmailSchema } from "@repo/db/schema";
import { sendEmail } from "@repo/email";

import { publicProcedure } from "../trpc";

export const authRouter = {
  verifyEmail: publicProcedure
    .input(VerifyNewUserEmailSchema)
    .mutation(async ({ input }) => {
      const email = input.email;
      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required.",
        });
      }

      const jwtSecret = process.env.JWT_SECRET as string;
      if (!jwtSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "JWT secret is required.",
        });
      }

      const emailToken = jwt.sign({ email }, jwtSecret, {
        expiresIn: "1h",
      });

      return await sendEmail({
        to: email,
        subject: "Email Verification",
        props: {
          type: "emailVerification",
          actionUrl: `${process.env.APP1_URL}/verify?token=${emailToken}`,
        },
      });
    }),
} satisfies TRPCRouterRecord;
