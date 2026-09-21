import ResultsChat from "@/components/ResultsChat";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-6">
      <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Refine your brand direction
      </h1>
      <ResultsChat boardId={id} />
    </main>
  );
}