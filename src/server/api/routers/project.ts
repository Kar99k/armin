import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        githubUrl: z.string(),
        githubToken: z.string().optional(),
        projectName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.userId) {
          throw new Error("User ID not found");
        }

        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            projectName: input.projectName,
            userToProject: {
              create: {
                userId: ctx.userId,
              },
            },
          },
        });

        return project;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to create project");
      }
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new Error("User ID not found");
    }
    const projects = await ctx.db.project.findMany({
      where: {
        userToProject: {
          some: {
            userId: ctx.userId,
          },
        },
        deletedAt: null,
      },
    });

    return projects;
  }),
});
