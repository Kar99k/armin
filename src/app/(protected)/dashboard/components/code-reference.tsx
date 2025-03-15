"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  filesReferences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};

export default function CodeReference({ filesReferences }: Props) {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);
  if (filesReferences.length === 0) return null;

  return (
    <div className="max-w-[70vw]">
      <Tabs defaultValue={tab} onValueChange={setTab} value={tab}>
        <div className="flex flex-wrap gap-2  rounded-md bg-gray-200 p-1">
          {filesReferences.map((file, index) => (
            <Button 
              key={index}
              onClick={() => setTab(file.fileName)}
              variant={tab === file.fileName ? "default" : "outline"}
              className="rounded-md"
            >
              {file.fileName}
            </Button>
          ))}
        </div>
        {filesReferences.map((file, index) => (
          <TabsContent
            key={index}
            value={file.fileName}
            className="!h-full max-h-[60vh] overflow-scroll rounded-md p-4"
          >
            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
