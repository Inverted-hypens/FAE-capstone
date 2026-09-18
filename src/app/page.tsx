import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground">
          Find your brand&apos;s true north
        </h1>
        <p className="text-muted-foreground">
          Brand Compass helps you shape a clear identity brief and explore
          creative directions for your brand.
        </p>
        <div>
          <Button render={<Link href="/brief" />}>Start your brief</Button>
        </div>
      </div>
    </main>
  );
}
