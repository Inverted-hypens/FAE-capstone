type HealthStatus = {
  ok: boolean;
  message: string;
  models: unknown[];
};

async function getHealthStatus(): Promise<HealthStatus> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      message: "GEMINI_API_KEY is not configured",
      models: [],
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return {
        ok: false,
        message: `Gemini API returned ${response.status} ${response.statusText}`,
        models: [],
      };
    }

    const data = (await response.json()) as { models?: unknown[] };

    return {
      ok: true,
      message: "Gemini API is reachable",
      models: data.models ?? [],
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to reach Gemini API",
      models: [],
    };
  }
}

export default async function HealthPage() {
  const status = await getHealthStatus();

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Health Check
        </h1>

        <div
          className={
            status.ok
              ? "rounded-lg border border-accent/30 bg-accent p-6 text-accent-foreground shadow-sm"
              : "rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive shadow-sm"
          }
        >
          <p className="font-heading text-lg font-semibold">
            {status.ok ? "Healthy" : "Unhealthy"}
          </p>
          <p className="mt-2 text-sm opacity-90">{status.message}</p>
          {status.ok && (
            <p className="mt-4 text-sm font-medium">
              {status.models.length} model
              {status.models.length === 1 ? "" : "s"} available
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
