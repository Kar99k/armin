/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// get all the details from the github repo
import { db } from "@/server/db";
import { Octokit } from "octokit";
import { summariseCommits } from "./gemini";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Commit = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitDate: string;
  commitAuthorImageUrl: string;
};

export const getCommitHashes = async (githubUrl: string): Promise<Commit[]> => {
  const [owner, repo] = githubUrl.split("/").slice(3);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort((a: any, b: any) => {
    return (
      new Date(b?.commit?.author?.date).getTime() -
      new Date(a?.commit?.author?.date).getTime()
    );
  });

  return sortedCommits.slice(0, 15).map((commit: any) => {
    return {
      commitHash: commit.sha as string,
      commitMessage: (commit.commit.message as string) ?? "",
      commitAuthorName: (commit.commit.author.name as string) ?? "",
      commitAuthorImageUrl: (commit.author.avatar_url as string) ?? "",
      commitDate: (commit.commit.author.date as string) ?? "",
    };
  });
};

/**
 * Polls and processes new commits for a given project
 * @param projectId - The ID of the project to poll commits for
 * @returns Newly created commit records in the database
 *
 * Function flow:
 * 1. Fetches the project's GitHub URL
 * 2. Gets the latest commit hashes from GitHub
 * 3. Filters out commits that were already processed
 * 4. Generates AI summaries for new commits
 * 5. Stores new commits with their summaries in the database
 */
export const pollCommits = async (projectId: string) => {
  // Fetch the project's GitHub URL from the database
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

  // Get the latest commits from the GitHub repository
  const commitHashes = await getCommitHashes(githubUrl);

  // Filter out commits that have already been processed and stored
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  // Generate AI summaries for all unprocessed commits in parallel
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>
      summariseCommitsResults(githubUrl, commit.commitHash),
    ),
  );

  // Extract successful summaries, failed ones become null
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    return null;
  });

  // Store new commits with their summaries in the database
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => ({
      projectId,
      commitHash: unprocessedCommits[index]!.commitHash,
      commitMessage: unprocessedCommits[index]!.commitMessage,
      commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
      commitAuthorImageUrl: unprocessedCommits[index]!.commitAuthorImageUrl,
      commitDate: unprocessedCommits[index]!.commitDate,
      summary: summary ?? "",
    })),
  });

  return commits;
};

async function summariseCommitsResults(githubUrl: string, commithHash: string) {
  //get the diff and pass the diff to ai

  const [owner, repo] = githubUrl.split("/").slice(3);

  try {
    const response = await fetch(
      `https://github.com/${owner}/${repo}/commit/${commithHash}.diff`,
    );

    const diff = await response.text();

    const summary = await summariseCommits(diff);

    return summary;
  } catch (error) {
    throw new Error("Failed to summarise commits", { cause: error });
  }
}

const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project not found");
  }

  return {
    project,
    githubUrl: project?.githubUrl,
  };
};

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Commit[],
) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );
  return unprocessedCommits;
}
