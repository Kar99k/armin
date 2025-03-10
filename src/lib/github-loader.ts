import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { type Document } from "@langchain/core/documents";
import { summariseCode, generateEmbedding } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (githubUrl: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: process.env.GITHUB_TOKEN,
    branch: await getDefaultBranch(githubUrl, process.env.GITHUB_TOKEN),
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lock",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();

  return docs;
};

export const indexGithubRepo = async (projectId: string, githubUrl: string) => {
  const docs = await loadGithubRepo(githubUrl);

  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding.values}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}`;
    }),
  );
};

/**
 * Generates embeddings for an array of documents from a GitHub repository
 * @param docs - Array of Document objects containing source code files
 * @returns Array of objects containing:
 *  - summary: AI-generated summary of the code
 *  - embedding: Vector embedding of the summary for similarity search
 *  - sourceCode: The actual source code content
 *  - fileName: Path to the source file
 */
const generateEmbeddings = async (docs: Document[]) => {
  // Process all documents in parallel using Promise.all
  return await Promise.all(
    docs.map(async (doc) => {
      // Step 1: Generate an AI summary of the code file
      const summary = await summariseCode(doc);

      // Step 2: Create a vector embedding of the summary for similarity search
      const embedding = await generateEmbedding(summary);

      // Step 3: Return object with summary, embedding, and metadata
      return {
        summary,
        embedding,
        // Deep clone the source code content to avoid reference issues
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)) as string,
        // Extract the file path from document metadata
        fileName: doc.metadata.source as string,
      };
    }),
  );
};

async function getDefaultBranch(githubUrl: string, token?: string) {
  // Extract owner and repo from GitHub URL
  const regex = /github\.com\/([^/]+)\/([^/]+)/;
  const match = regex.exec(githubUrl);
  if (!match) throw new Error("Invalid GitHub URL");
  const [, owner, repo] = match;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.statusText}`);
  }

  const data = (await response.json()) as { default_branch: string };
  return data.default_branch;
}
