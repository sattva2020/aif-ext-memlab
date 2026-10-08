## Project Memory (from aif-ext-memlab)

Optional: if the memlab MCP tools (`search_decisions`, `search_code`, under
whatever server prefix your runtime gives them) are not available, return an
error, or return nothing, fix as described above.

Before diagnosing:

1. `search_decisions` with the symptom — a postmortem or note may already name
   the root cause or a fix that was tried and reverted.
2. `search_code` with the symptom to find candidate code; use `explain` on the
   function you are about to change to see every caller, so the fix lands where
   all of them route through.

After the fix, if the root cause is non-obvious and the memlab `add_note` tool
is available, offer to record it (one-line summary, then context and file
paths). Do not record it without the user's consent.
