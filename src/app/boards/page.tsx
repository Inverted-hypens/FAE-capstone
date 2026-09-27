import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function BoardsPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          No boards yet
        </h1>
        <p className="text-muted-foreground">
          You don&apos;t have any saved brand boards yet.
        </p>
        <div className="pt-2">
          <Link href="/brief" className={buttonVariants({ variant: "default" })}>
            Start a new brand brief
          </Link>
        </div>
      </div>
    </main>
  );
}
