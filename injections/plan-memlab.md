## Project Memory (from aif-ext-memlab)

Optional: if the memlab MCP tools (`search_decisions`, `search_code`, under
whatever server prefix your runtime gives them) are not available, return an
error, or return nothing, plan as described above.

Before writing tasks:

1. `search_decisions` with the feature description. If a prior decision
   constrains the approach, follow it and cite its path in the plan; if the
   plan has to depart from it, say so explicitly in the plan.
2. `search_code` with the feature description to find the files the change will
   touch, then read them before naming them in tasks. Use `explain` on a symbol
   to see who else depends on it before planning a change to it.
