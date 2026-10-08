# aif-ext-memlab

Project memory for [AI Factory](https://github.com/lee-to/ai-factory) through
[memlab](https://github.com/sattva2020/memlab): past decisions (ADRs, postmortems,
notes) and the code a change actually touches, served locally over MCP.

The extension adds no code to your project and no new skills. It does two things:

1. Registers the memlab MCP server (`memlab serve --root .`) for every installed
   agent that supports MCP.
2. Appends a short "Project Memory" section to four core skills:

| Skill | What it asks memlab |
|---|---|
| `/aif-warmup` | `search_decisions` once; adds a **Decisions** section (≤ 5 records) to the handoff. No code search — warmup stays read-only and code-free. |
| `/aif-explore` | `search_decisions` + `search_code` on the topic before scanning files; `explain` / `find_path` for "what touches X". |
| `/aif-plan` | Prior decisions that constrain the approach, and the files the change touches. |
| `/aif-fix` | Postmortems for the symptom, every caller of the function being changed; offers `add_note` for a non-obvious root cause (only with consent). |

**Optional by construction.** Each section starts with the same rule: if the memlab
tools are missing, fail, or return nothing, the skill runs exactly as in core.
`ai-factory extension remove aif-ext-memlab` strips the sections and the server entry.

## Install

```bash
pip install git+https://github.com/sattva2020/memlab   # Python 3.11+, see memlab's README for GPU
ai-factory extension add https://github.com/sattva2020/aif-ext-memlab.git
```

If you use the memlab **Claude Code plugin**, it already starts a memlab server:
remove the `memlab` entry this extension adds to `.mcp.json`, or two servers start.
The skill sections work with either, whatever prefix the runtime gives the tools.

## What memlab is

A local index of the repository: chunks at declarations and headings, BM25 plus two
small open embedding models, Personalized PageRank over import and symbol-reference
edges. No LLM calls at index or query time; the first build takes about a minute on a
mid-size repository. Decisions (`docs/adr/`, `docs/decisions/`, `docs/postmortems/`,
`docs/notes/`) are a separate channel from code. Benchmarks, limits and the
pre-registered evaluation are in memlab's README.

Limits worth knowing before installing: Python 3.11+, about 2.6 GB of models (GPU if
present, CPU otherwise, re-ranking only on GPU), import resolution for Dart and TS/JS
only (other languages are linked through symbol references).

## Development

```bash
npm test   # manifest + injection checks (node --test)
```

Disclosure: memlab and this extension are by the same author.

## License

MIT. memlab itself is Apache 2.0.
