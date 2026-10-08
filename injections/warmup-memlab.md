## Project Memory (from aif-ext-memlab)

This section amends Step 2 and Step 3. It is optional: if the memlab MCP tools
(`search_decisions`, `search_code`, under whatever server prefix your runtime
gives them) are not available, return an error, or return nothing, skip this
section and finish warmup exactly as described above. memlab silence is never
a warmup failure.

memlab is a read-only index of this repository, so querying it does not break
the warmup boundaries.

1. After reading the core artifacts, call `search_decisions` once with the
   active roadmap priority or, if the user named a topic, with that topic.
2. Add a **Decisions** section to the handoff: at most five records that affect
   the next task, each as `path` + one line. Prefer the newest when two records
   cover the same question, and name the conflict when they disagree.
3. If a record contradicts a core artifact, report it under **Gaps** with both
   sources; do not pick one silently.
4. List the memlab query under **Loaded**.

Do not call `search_code` during warmup; code is loaded on demand by the next task.
