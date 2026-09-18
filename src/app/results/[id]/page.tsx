export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Results for board {id}
        </h1>
        <p className="text-muted-foreground">
          Brand identity results will appear here.
        </p>
      </div>
    </main>
  );
}
