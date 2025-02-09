import { pollCommits } from "@/lib/github";
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

        await pollCommits(project.id);
        return project;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to create project");
      }
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        userToProject: {
          some: {
            userId: ctx.userId,
          },
        },
      },
    });

    return projects;
  }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const commits = await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });

      return commits;
    }),
    
});
