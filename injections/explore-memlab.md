## Project Memory (from aif-ext-memlab)

Optional: if the memlab MCP tools (`search_decisions`, `search_code`, under
whatever server prefix your runtime gives them) are not available, return an
error, or return nothing, explore as described above. memlab silence is never
an error.

When the topic is known, before scanning files:

1. `search_decisions` with the topic — prior ADRs, postmortems and notes. Bring
   up the ones that constrain the discussion; a decision already taken is not an
   open question.
2. `search_code` with the topic — use the returned `path:line` hits as the
   entry points, then read those sources directly. Fall back to Glob/Grep for
   what memlab did not cover.
3. For "what touches X" or "how does A reach B", use `explain` or `find_path`
   instead of tracing imports by hand.

memlab is built when its server starts and does not see files changed later in
the session. Verify any fact from a result against the source before relying on it.
