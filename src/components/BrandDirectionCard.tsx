import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { brandDirectionInputSchema } from "@/lib/ai/tools/generate-brand-direction";
import type { z } from "zod";

type BrandDirectionInput = z.infer<typeof brandDirectionInputSchema>;
type ContrastEntry = { role: string; name: string; hex: string; ratio: number; passesAA: boolean };
type BrandDirectionOutput = { board: BrandDirectionInput; contrastReport: ContrastEntry[] };

type ToolPart =
  | { type: "tool-generateBrandDirection"; toolCallId: string; state: "input-streaming"; input: Partial<BrandDirectionInput> }
  | { type: "tool-generateBrandDirection"; toolCallId: string; state: "input-available"; input: BrandDirectionInput }
  | { type: "tool-generateBrandDirection"; toolCallId: string; state: "output-available"; input: BrandDirectionInput; output: BrandDirectionOutput }
  | { type: "tool-generateBrandDirection"; toolCallId: string; state: "output-error"; input: BrandDirectionInput; errorText: string };

function StateShell({ icon, label, tone, children }: { icon: React.ReactNode; label: string; tone: "muted" | "destructive"; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm", tone === "destructive" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-muted/50 text-muted-foreground")}>
      <div className="flex items-center gap-2 font-medium">{icon}{label}</div>
      {children}
    </div>
  );
}

export function BrandDirectionToolPart({ part }: { part: ToolPart }) {
  if (part.state === "input-streaming") {
    return <StateShell icon={<Loader2 className="size-4 animate-spin" />} tone="muted" label="Drafting the brand direction…" />;
  }
  if (part.state === "input-available") {
    return <StateShell icon={<Loader2 className="size-4 animate-spin" />} tone="muted" label="Checking palette contrast…" />;
  }
  if (part.state === "output-error") {
    return (
      <StateShell icon={<AlertTriangle className="size-4" />} tone="destructive" label="Couldn't finalize the direction">
        <p className="mt-1 text-xs">{part.errorText}</p>
      </StateShell>
    );
  }
  const { board, contrastReport } = part.output;
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Color palette</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {board.colorPalette.map((c) => {
            const contrast = contrastReport.find((r) => r.hex === c.hex);
            return (
              <div key={c.hex} className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
                <span className="size-5 rounded-full border border-border/50" style={{ backgroundColor: c.hex }} />
                <div className="text-xs">
                  <div className="font-medium text-foreground">{c.name} · {c.role}</div>
                  <div className="text-muted-foreground">{c.hex}</div>
                </div>
                {contrast ? (
                  <span className={cn("flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", contrast.passesAA ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive")} title={`Contrast ratio ${contrast.ratio}:1 against background`}>
                    {contrast.passesAA ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                    {contrast.ratio}:1
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Typography</h3>
        <div className="mt-2 space-y-1 text-sm">
          {board.typography.map((t) => (
            <p key={t.role}><span className="font-medium">{t.role}:</span> {t.fontName} ({t.weight}) — {t.usageNote}</p>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Logo directions</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {board.logoDirections.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Voice & tone</h3>
        <p className="mt-1 text-sm text-muted-foreground">{board.voiceAndTone.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {board.voiceAndTone.traits.map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">{t}</span>)}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Brand principles</h3>
        <p className="mt-1 text-sm text-muted-foreground">{board.brandPrinciples.description}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {board.brandPrinciples.principles.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>
    </div>
  );
}
