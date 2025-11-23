import type { Pattern } from '../pattern'
import {
	newLeafSuccessResult,
	wrapPatternLike,
	wrapSuccessResult,
} from '../pattern-utils'
import { Tree } from '../tree'

declare global {
	interface RegExpConstructor {
		escape(str: string): string
	}
}

export const repeat0 = wrapPatternLike(
	(pattern: Pattern): Pattern =>
		source => {
			const children: Array<Tree> = []
			let consumed = 0
			let rest = source

			while (true) {
				const match = pattern(rest)
				if (match === null) break

				children.push(match.tree)
				consumed += match.consumed
				rest = match.rest
			}

			return {
				tree: Tree.newTree(source.take(consumed)!, children),
				consumed,
				rest,
			}
		},
)

export const repeat1 = wrapPatternLike(
	(pattern: Pattern): Pattern =>
		source => {
			const match = pattern(source)
			if (match === null) return null

			const children = [match.tree]
			let { consumed, rest } = match

			while (true) {
				const match = pattern(rest)
				if (match === null) break

				children.push(match.tree)
				consumed += match.consumed
				rest = match.rest
			}

			return {
				tree: Tree.newTree(source.take(consumed)!, children),
				consumed,
				rest,
			}
		},
)

export const seq = wrapPatternLike(
	(...patterns: Pattern[]): Pattern =>
		source => {
			const children: Array<Tree> = []
			let consumed = 0
			let rest = source

			for (const pattern of patterns) {
				const match = pattern(rest)
				if (match === null) return null

				children.push(match.tree)
				consumed += match.consumed
				rest = match.rest
			}

			return {
				tree: Tree.newTree(source.take(consumed)!, children),
				consumed,
				rest,
			}
		},
)

export const alt = wrapPatternLike(
	(...patterns: Pattern[]): Pattern =>
		source => {
			for (const pattern of patterns) {
				const match = pattern(source)
				if (match !== null) return wrapSuccessResult(match)
			}

			return null
		},
)

export const either = wrapPatternLike(
	(pattern1: Pattern, pattern2: Pattern): Pattern =>
		source => {
			const match1 = pattern1(source)
			if (match1 !== null) return wrapSuccessResult(match1)

			return wrapSuccessResult(pattern2(source))
		},
)

export const opt = wrapPatternLike(
	(pattern: Pattern): Pattern =>
		source =>
			wrapSuccessResult(pattern(source)) ??
			newLeafSuccessResult(source, 0),
)

export const separatedBy0 = wrapPatternLike(
	(item: Pattern, separator: Pattern) =>
		seq(repeat0(seq(item, separator)), opt(item)),
)

export const separatedBy1 = wrapPatternLike(
	(item: Pattern, separator: Pattern) =>
		seq(item, repeat0(seq(separator, item))),
)

export const until =
	(endsWith: string): Pattern =>
	source => {
		const nextIndex = source.window.indexOf(endsWith)
		if (nextIndex === -1) return null
		return newLeafSuccessResult(source, nextIndex)
	}

// matches to empty string
export const empty: Pattern = source => newLeafSuccessResult(source, 0)

export const eof: Pattern = source => {
	if (source.isEmpty()) return newLeafSuccessResult(source, 0)

	return null
}

export const lookahead = wrapPatternLike(
	(pattern: Pattern, lookahead: Pattern): Pattern =>
		source => {
			const lookaheadMatch = lookahead(source)
			if (lookaheadMatch === null) return null

			return pattern(source)
		},
)

export const negativeLookahead = wrapPatternLike(
	(pattern: Pattern, lookahead: Pattern): Pattern =>
		source => {
			const lookaheadMatch = lookahead(source)
			if (lookaheadMatch !== null) return null

			return pattern(source)
		},
)

export const assocLeft = wrapPatternLike(
	(item: Pattern, extra: Pattern): Pattern =>
		source => {
			// A ::= A item | extra
			// -> turn into
			// extra (item extra)*

			const extraMatch = extra(source)
			if (extraMatch === null) return null

			let { tree, rest, consumed } = extraMatch

			while (true) {
				const itemMatch = item(rest)
				if (itemMatch === null) break

				consumed += itemMatch.consumed
				rest = itemMatch.rest

				tree = Tree.newTree(source.take(consumed)!, [
					tree,
					itemMatch.tree,
				])
			}

			return {
				tree,
				consumed,
				rest,
			}
		},
)
