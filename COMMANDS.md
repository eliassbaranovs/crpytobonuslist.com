# Plugin Commands Reference

All available slash commands and skills from installed plugins. Use via the Skill tool or by typing the command name.

---

## Superpowers (`superpowers`)

| Command | What it does | When to run |
|---------|-------------|-------------|
| `superpowers:brainstorming` | Explores user intent, requirements, and design before implementation | Before any creative work — new features, components, modifications |
| `superpowers:writing-plans` | Creates step-by-step implementation plans from specs/requirements | When you have a spec or requirements for a multi-step task, before coding |
| `superpowers:executing-plans` | Executes a written plan in a separate session with review checkpoints | When you have a written implementation plan ready to execute |
| `superpowers:dispatching-parallel-agents` | Runs 2+ independent tasks in parallel via subagents | When facing independent tasks with no shared state or sequential deps |
| `superpowers:subagent-driven-development` | Executes plans with independent subtasks using subagents | When executing plans with parallelizable work in the current session |
| `superpowers:test-driven-development` | Enforces TDD: write tests first, then implementation | Before writing any implementation code for features or bugfixes |
| `superpowers:systematic-debugging` | Structured root-cause analysis before proposing fixes | Any bug, test failure, or unexpected behavior |
| `superpowers:verification-before-completion` | Runs verification commands before claiming work is done | Before committing, creating PRs, or claiming a task is complete |
| `superpowers:requesting-code-review` | Requests structured code review against requirements | After completing features or before merging |
| `superpowers:receiving-code-review` | Processes review feedback with technical rigor | When receiving code review feedback, before implementing suggestions |
| `superpowers:finishing-a-development-branch` | Guides merge/PR/cleanup decisions for completed work | When implementation is complete and all tests pass |
| `superpowers:using-git-worktrees` | Creates isolated git worktrees for feature work | Before starting feature work that needs isolation |
| `superpowers:writing-skills` | Creates or edits custom skills | When building new skills or editing existing ones |
| `superpowers:using-superpowers` | Session bootstrap — establishes skill discovery | Auto-triggers at session start |

**Deprecated (redirect to above):** `/brainstorm`, `/execute-plan`, `/write-plan`

---

## UI UX Pro Max (`ui-ux-pro-max`)

| Command | What it does | When to run |
|---------|-------------|-------------|
| `ui-ux-pro-max:ui-ux-pro-max` | Full UI/UX design intelligence — plan, build, review, fix, optimize | Any UI/UX task: new pages, component design, accessibility review, style selection |
| `ui-ux-pro-max:design-system` | Design token architecture, component specs, semantic tokens, Tailwind integration | Setting up or auditing design tokens and component systems |
| `ui-ux-pro-max:design` | Logo design, icon generation, CIP (Corporate Identity Package), social photos | Creating visual brand assets — logos, icons, identity packages |
| `ui-ux-pro-max:brand` | Brand guidelines, voice framework, visual identity, typography specs | Building or auditing brand guidelines and consistency |
| `ui-ux-pro-max:banner-design` | Banner sizes, styles, and generation | Creating web banners for ads or promotions |
| `ui-ux-pro-max:slides` | Presentation slide creation with layout patterns and copy formulas | Building slide decks and presentations |
| `ui-ux-pro-max:ui-styling` | Shadcn component scaffolding, Tailwind config generation | Adding shadcn components or generating Tailwind configs |

**Python search tool** (run before any UI/UX work):
```bash
python "C:/Users/elias/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/2.0.1/cli/assets/scripts/search.py" "<keywords>" --design-system -p "Project Name"
```
Available `--domain` searches: `product`, `style`, `color`, `typography`, `chart`, `ux`, `google-fonts`, `landing`, `react`, `web`, `prompt`

---

## Claude-Mem (`claude-mem`)

| Command | What it does | When to run |
|---------|-------------|-------------|
| `claude-mem:make-plan` | Creates detailed phased implementation plans with documentation discovery | When planning a feature or multi-step task before execution |
| `claude-mem:do` | Executes a phased plan using subagents | When asked to execute/run/carry out a plan created by make-plan |
| `claude-mem:mem-search` | Searches persistent cross-session memory database | When user asks "did we solve this before?", "how did we do X last time?" |
| `claude-mem:smart-explore` | Token-optimized AST code exploration via tree-sitter parsing | When you need to understand code structure without reading full files |

---

## Frontend Design (`frontend-design`)

| Command | What it does | When to run |
|---------|-------------|-------------|
| `frontend-design:frontend-design` | Creates production-grade frontend interfaces with high design quality | When building web components, pages, or applications |

**Note:** Overlaps with `ui-ux-pro-max:ui-ux-pro-max`. Prefer UI UX Pro Max for design system intelligence. Use Frontend Design as a fallback for quick component generation.

---

## Web Asset Generator (`web-asset-generator`)

| Command | What it does | When to run |
|---------|-------------|-------------|
| `web-asset-generator:web-asset-generator` | Generates favicons, PWA app icons, and social media meta images (OG images) | When needing favicons, app icons, or social sharing images from logos or text |

---

## Context7 (`context7`)

Not a slash command — provides MCP tools for fetching up-to-date library documentation:

| Tool | What it does | When to run |
|------|-------------|-------------|
| `resolve-library-id` | Resolves a library name to its Context7 ID | Before querying docs for a specific library |
| `query-docs` | Fetches current documentation and code examples | When you need up-to-date docs for any library/framework |

---

## Playwright (`playwright`)

Not slash commands — provides MCP tools for browser automation:

| Tool | What it does |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_snapshot` | Capture accessibility snapshot of the page |
| `browser_click` / `browser_fill_form` / `browser_type` | Interact with page elements |
| `browser_take_screenshot` | Take a screenshot |
| `browser_evaluate` / `browser_run_code` | Execute JavaScript on the page |
| `browser_console_messages` / `browser_network_requests` | Debug page behavior |

Use for: visual testing, UI debugging, scraping verification, end-to-end testing.
