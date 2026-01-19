import { vaultKey } from "@repo/db/schema";
import { protectedProcedure } from "../trpc";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";

export const vaultKeyRouter = {
    createVaultKey: protectedProcedure.input(z.object({
        userId: z.string(),
        key: z.string(),
        iv: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const { userId, key, iv } = input;
        if(!userId || !key || !iv) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Missing required fields" });
        }
        const { db } = ctx;
        const vaultKeyData = await db.insert(vaultKey).values({
            userId,
            key,
            iv,
        }).returning();

        return { success: true,vaultKeyData };
    }),
}