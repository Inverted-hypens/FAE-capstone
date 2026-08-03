# Workflow: vague vs. engineered prompting (FE-03)

## The drill
Built the same feature — a brand brief input form — twice. Round 1 used a single
one-sentence prompt with no context ("Build a form for entering a brand brief"),
fresh session, on `feature/brief-form-vague`. Round 2 used a precise prompt with
file references, field-level constraints, explicit edge cases, accessibility
requirements, and a required test-first verification step, in a separate fresh
session, on `feature/brief-form-engineered`.

## Structure
Round 1 crammed the entire form — state, handlers, markup — into a 228-line
`page.tsx`, duplicating the same long Tailwind class string across all seven
inputs. Round 2 produced a 9-line `page.tsx` that just imports and renders a
separate `BrandBriefForm.tsx` component, because the prompt specified a file
path (`components/BrandBriefForm.tsx`) rather than letting the model decide
where the code lived.

## Correctness
Round 1 has zero validation. You can submit every field empty and it shows
a success message. Nothing in the vague prompt asked for validation, so
none exists — but this is exactly the trap: the form *looks* complete.
Round 2 enforces per-field length rules and required/optional splits via a
zod schema, all boundary-tested (empty submit, 151-char description, 0 and
6 personality traits, 2 keywords).

## Accessibility
Round 1 ties labels to inputs via `htmlFor`/`id` but has no error states to
link, since nothing gets rejected. Round 2 adds `aria-describedby`,
`role="alert"` on error text, and focus-shifts to the first invalid field
on submit. It falls short on one explicit requirement, though: the
personality-trait selector's "selected" state is shown only through a
background/text color swap (`bg-zinc-950 text-white`), with the actual
checkbox visually hidden — despite the prompt explicitly requiring
selection not rely on color alone. Caught during review, logged in
`KNOWN_ISSUES.md`, not yet fixed.

## Edge cases
Round 2's test suite covers every boundary case listed in the prompt except
one: individual keyword length (1–20 chars each). The zod schema checks
keyword *count* but never validates each keyword's length, so a single
40-character "keyword" would pass. Second entry in `KNOWN_ISSUES.md`.

## Review effort
Round 1 took seconds to generate but required a full manual read-through to
discover the missing validation — nothing about it signaled incompleteness
on the surface. Round 2 took much longer to prompt (a multi-paragraph spec
vs. one sentence) but review effort was lower and more targeted: with tests
already documenting coverage, review meant checking the two areas the tests
didn't touch, not re-deriving what was covered from scratch. The mentor tip
about round 2 "feeling slower but being faster end-to-end" held true here —
the vague round's real cost showed up in review, not generation.
