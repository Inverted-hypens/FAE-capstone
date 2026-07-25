# AGENTS.md

Instructions for AI agents working in this repository.

## Project

Flyrank Frontend AI Engineering capstone. Early setup — update this file as the stack solidifies.

## Stack (skeleton)

| Layer       | Choice            | Notes                      |
| ----------- | ----------------- | -------------------------- |
| Language    | TypeScript        | confirm or change          |
| Framework   | TBD               | e.g. React, Next.js        |
| Styling     | TBD               | e.g. Tailwind, CSS Modules |
| State       | TBD               |                            |
| API / Data  | TBD               |                            |
| Testing     | TBD               | e.g. Vitest, Playwright    |
| Package mgr | npm / pnpm / yarn | pick one                   |
| Node        | TBD               | e.g. 20.x                  |

## Development

```bash
npm install    # update when package.json exists
npm run dev
npm run build
npm test
npm run lint
```

## Environment

- Secrets in `.env` — never commit
- Document variables here as they are added

## Git & commits

### Author identity

```
user.name  = Bestman Sene
user.email = sjsoulute@gmail.com
```

### Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples:**

```
docs: add README and license
docs: add gitignore
feat(auth): add login form
fix(api): handle 401 on token expiry
```

**Rules:**

- Imperative mood, lowercase description, no trailing period
- Optional scope: `feat(ui):`, `fix(api):`
- Breaking changes: `feat!:` or `BREAKING CHANGE:` footer
- Reference issues: `Closes #123`

## Code conventions

Skeleton — expand as patterns emerge.

### Tooling (TBD)

- Formatting: e.g. Prettier
- Linting: e.g. ESLint

### Naming

- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utilities: camelCase
- Constants: pick UPPER_SNAKE_CASE or camelCase and stay consistent

### Imports

TBD — e.g. absolute paths via `@/`, grouped order

### Comments

Only for non-obvious logic; prefer self-documenting code

## AI workflow

- Read surrounding code before editing; match existing patterns
- Minimal diffs — no unrelated refactors
- Use Conventional Commits when committing
- Do not commit unless explicitly asked
- Never commit `.env` or secrets
- Run tests/lint when available before finishing

## Links (TBD)

- Repository, Figma, API docs, deployment
