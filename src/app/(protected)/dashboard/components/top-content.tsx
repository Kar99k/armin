"use client";
import { ExternalLinkIcon, Github } from "lucide-react";
import useProject from "@/hooks/use-project";
import Link from "next/link";
const TopContent = () => {
  const { project } = useProject();

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-4">
      {/* Github Link */}
      <div className="flex w-fit items-center rounded-lg bg-primary px-4 py-3">
        <Github className="size-5 text-white" color="white" />
        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-white">
            This project is connected to{" "}
            <Link
              href={project?.githubUrl ?? ""}
              target="_blank"
              className="inline-flex items-center text-primary-foreground hover:underline"
            >
              {project?.githubUrl}
              <ExternalLinkIcon className="ml-1 size-4" />
            </Link>
          </p>
        </div>
      </div>
      <div className="h-4"></div>

      <div className="flex items-center gap-4">
        Team Members Invite Button Archive Button
      </div>
    </div>
  );
};

export default TopContent;
