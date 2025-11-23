import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [process.env.APP1_URL, process.env.APP2_URL].filter(
          (url): url is string => Boolean(url)
        )
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
        ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"];
