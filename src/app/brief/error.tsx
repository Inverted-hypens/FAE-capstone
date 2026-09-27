"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
