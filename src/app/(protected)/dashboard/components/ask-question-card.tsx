"use client";

import useProject from "@/hooks/use-project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { askQuestion } from "../actions";
import { readStreamableValue } from "ai/rsc";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const wordCount = question.trim().split(/\s+/).length;
    if (!question || wordCount < 3) return;
    if (!project?.id) return;

    e.preventDefault();

    setIsOpen(true);
    setIsLoading(true);

    const { output, fileReferences } = await askQuestion(question, project.id);
    setFileReferences(fileReferences);
    
    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((prev) => prev + delta);
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Armin</DialogTitle>
          </DialogHeader>

          {answer && <div className="prose">{answer}</div>}

          {fileReferences.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">File References</h3>
              <ul className="list-disc pl-5">
                {fileReferences.map((file) => ( 
                  <li key={file.fileName}>
                    <a href={`#${file.fileName}`}>{file.fileName}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
            <Textarea
              placeholder="Type your question here..."
              className="min-h-[100px] resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button type="submit">Ask Armin</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
