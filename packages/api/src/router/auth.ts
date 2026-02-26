import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { z } from "zod/v4";

import { VerifyNewUserEmailSchema } from "@repo/db/schema";
import { sendEmail } from "@repo/email";

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

      await sendEmail({
        to: email,
        subject: "Email Verification",
        props: {
          type: "emailVerification",
          actionUrl: `${process.env.WEB_APP_URL}/verify?token=${emailToken}`,
        },
      });

      return { email };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { token } = input;
      if (!token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token is required",
        });
      }

      const jwtSecret = process.env.JWT_SECRET as string;
      if (!jwtSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "JWT secret is required.",
        });
      }

      const decodedToken = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!decodedToken.email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email not found from the token",
        });
      }

      return { email: decodedToken.email };
    }),
} satisfies TRPCRouterRecord;
