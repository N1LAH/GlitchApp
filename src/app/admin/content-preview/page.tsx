"use client";

import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import puzzles from "@/../content/puzzles/index.json";
import { Suspense } from "react";

function ContentPreviewContent() {
  const searchParams = useSearchParams();
  const providedKey = searchParams.get("key");
  const expectedKey =
    process.env.NEXT_PUBLIC_ADMIN_PREVIEW_KEY || "preview";

  const isAuthorized = providedKey === expectedKey;

  if (!isAuthorized) {
    return (
      <Container className="py-8">
        <Alert className="max-w-2xl mx-auto bg-red-900/20 border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            <strong>Unauthorized</strong>
            <p className="mt-2">
              You do not have permission to view this page. Please provide a
              valid preview key in the URL query parameter.
            </p>
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Card className="max-w-4xl mx-auto bg-slate-900/80 border-glitch-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl text-glitch-primary">
            Content Preview (Admin)
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Raw puzzle data from content/puzzles/index.json
          </p>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs text-slate-300">
            {JSON.stringify(puzzles, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function ContentPreviewPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="text-center text-slate-400">Loading...</div>
        </Container>
      }
    >
      <ContentPreviewContent />
    </Suspense>
  );
}
