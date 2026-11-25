<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Blog comments: public reads only approved rows (RLS + column grants); writes only via the `submitComment` server function with the admin client, forced to `pending`. Why: no public insert path can bypass validation, spam checks or moderation.
- Comment moderation happens in the Lovable Cloud data panel (edit `blog_comments.status`), not an in-app admin page. Why: avoids any public admin signup surface.
- Private `/admin` panel: authorization requires a pre-approved UUID in `public.admin_users` (checked already at AAL1 before TOTP enrollment) and verified `aal = 'aal2'` JWT claims enforced in both server functions (`requireSupabaseAuth`) and PostgreSQL RLS/RPCs (`is_authorized_admin_aal2`). Why: prevents unauthorized access or metric reads even via direct API calls.
- Funnel & presence telemetry: public signals enter only via `POST /api/telemetry` (strict Zod + 512-byte limit + same-origin check + `supabaseAdmin` RPC `ingest_funnel_signal`), never direct browser table writes; `/admin` is excluded and records auto-prune after 30 days. Why: keeps raw analytics tables private, deduplicated, PII-free and bounded.
