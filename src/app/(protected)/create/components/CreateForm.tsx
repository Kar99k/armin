"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "react-hot-toast";
import { useState } from "react";
import useRefetch from "@/hooks/use-refetch";

const formSchema = z.object({
  repoUrl: z.string().url({ message: "Please enter a valid URL" }),
  projectName: z.string().min(1, { message: "Project name is required" }),
  githubToken: z
    .string()
    .min(1, { message: "GitHub token is required" })
    .optional(),
});

const CreateForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      projectName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    void toast.promise(
      createProject.mutateAsync({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken ?? "",
        projectName: data.projectName,
      }),
      {
        loading: "Creating project...",
        success: () => {
          form.reset();
          setIsLoading(false);
          void refetch().then();
          return "Project created successfully";
        },

        error: () => {
          setIsLoading(false);
          return "Failed to create project";
        },
      },
    );
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Link your GitHub Repository</CardTitle>
          <CardDescription>
            Enter the URL of your repository to link it to Armin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Project Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Repository URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="githubToken"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="GitHub Token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateForm;
