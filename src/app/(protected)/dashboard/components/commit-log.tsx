"use client";

import Image from "next/image";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";

const CommitLog = () => {
  const { projectId } = useProject();

  if (!projectId) throw new Error("Project ID is required");

  const { data: commits } = api.project.getCommits.useQuery({
    projectId,
  });

  return (
    <div className="flex flex-col gap-4">
      {commits?.map((commit, index) => (
        <li className="flex items-start gap-2" key={commit.id}>
          {/* Avatar */}
          <div className="relative flex h-fit flex-col items-center">
            <Image
              src={commit.commitAuthorImageUrl}
              alt={commit.commitAuthorName}
              className="rounded-full"
              width={32}
              height={32}
            />
            {index !== commits.length - 1 && (
              <div className="absolute left-1/2 top-[32px] h-full w-px bg-gray-200" />
            )}
          </div>

          <div className="flex w-full flex-col gap-2 rounded-md border px-3 pb-4 pt-3">
            {/* Header */}
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">{commit.commitAuthorName}</p>
                <p className="flex cursor-pointer items-center gap-1 text-sm text-gray-500">
                  commited <ExternalLink className="h-4 w-4" />
                </p>
              </div>
              <time className="text-sm text-gray-500">
                {commit.commitDate.toLocaleString()}
              </time>
            </div>

            {/* Title */}
            <h1 className="max-w-screen-sm overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium">
              {commit.commitMessage}
            </h1>

            <pre className="h-fit whitespace-pre-wrap break-words rounded-md border bg-secondary p-3 text-sm italic text-secondary-foreground">
              {commit.summary}
            </pre>
          </div>
        </li>
      ))}
    </div>
  );
};

export default CommitLog;
