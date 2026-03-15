import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { canAddMember, canCreateOrg } from "@repo/auth/entitlements";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string(), slug: z.string() }))
    .mutation(async ({ ctx }) => {
      const canCreate = await canCreateOrg(ctx.session.user.id);
      if (!canCreate) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You have reached the limit of organizations for your plan. Please upgrade.",
        });
      }

      // The actual creation is handled by Better Auth, but we can provide a wrapper if needed.
      // For now, we assume the frontend calls Better Auth directly,
      // but this procedure serves as a placeholder for manual enforcement.
      return { success: true };
    }),

  inviteMember: protectedProcedure
    .input(z.object({ organizationId: z.string(), email: z.string() }))
    .mutation(async ({ input }) => {
      const canAdd = await canAddMember(input.organizationId);
      if (!canAdd) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "This organization has reached the limit of members for its plan. Please upgrade.",
        });
      }

      // Again, Better Auth handles the actual invitation.
      return { success: true };
    }),
});
