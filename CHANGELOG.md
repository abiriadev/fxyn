# Changelog

## v0.4.0 - 2025-11-13

- Breaking Changes
    - Direct imports from `src/combinator.ts` should be updated to the new `src/combinators/*` or through `src/index.ts` re-exports.

- Added
    - New combinator modules under `src/combinators/` (`char`, `match`, `combinator`, `index`) with reorganized exports.
    - Regex support and ability to use plain strings directly as patterns (`toPattern`), and `p()` now accepts `PatternLike`.
    - Recursive pattern helper `rec()` and lookahead combinators; repeated variations (e.g., `repeat0`) and `eof`.
    - Mermaid renderer (`renderMermaid`) and span highlighter stream utilities for visualizing parse trees.
    - Tree utilities: `projectToNamed()`, `extend()`, and id generator support (`id-generator`), plus `isTerminal`/`isNamed` helpers.
    - New examples: wiki-markup parser and s-expression parser; JSON example updated to use direct literal feature.

- Changed
    - Major refactor and rewrite around new features and improved type inference.
    - Combinators reorganized; previous `src/combinator.ts` removed in favor of the new module structure (import paths may need updating).
    - `package.json` updated; added `es-toolkit` as a runtime dependency.
