# Known issues — round 2 (feature/brief-form-engineered)

Found during FE-03 review, not yet fixed:

1. **Personality-trait selector relies on color alone.** Selected state is shown only via `bg-zinc-950 text-white` vs `border-zinc-300 text-zinc-700` on the trait pills — the checkbox itself is visually hidden (`sr-only`). Violates the accessibility requirement that selection not rely on color alone. Fix: add a visible non-color indicator (checkmark icon, border-weight change, etc.) alongside the color change.

2. **Individual keyword length isn't validated.** Schema only checks `keywords` splits into exactly 3 whitespace-separated words — it doesn't enforce each word being 1-20 characters as specified. Fix: extend the zod `.refine()` to also check each split word's length.
