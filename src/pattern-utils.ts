import { matchString } from './match'
import type { MatchResult, Pattern } from './pattern'
import type { SpannedString } from './spanned-string'
import { Tree } from './tree'

export type PatternLike = Pattern | string

export const toPattern = (from: PatternLike) =>
	typeof from === 'string' ? matchString(from) : from

export const p = (name: string, pattern: PatternLike, hidden = false) => {
	const resolvedPattern = toPattern(pattern)

	const namedPattern: Pattern = source => {
		const match = resolvedPattern(source)

		if (match === null) return null

		match.tree.name = name
		match.tree.hidden = hidden
		return match
	}

	namedPattern.p = name

	return namedPattern
}

// allow combinator to support `PatternLike` types, like raw string.
export const wrapPatternLike =
	<T extends Array<Pattern>, U>(combinator: (...patterns: T) => U) =>
	(...patternLikes: { [K in keyof T]: PatternLike }) =>
		combinator(...(patternLikes.map(toPattern) as T))

// NOTE: this is a quick helper. it does not check slice validity and assumes that the caller already proved it.
export const newLeafSuccessResult = (
	source: SpannedString,
	consumed: number,
) => ({
	tree: Tree.newLeaf(source.take(consumed)!),
	consumed,
	rest: source.skip(consumed)!,
})

export const wrapSuccessResult = (matchResult: MatchResult) =>
	matchResult !== null
		? {
				...matchResult,
				tree: Tree.newTree(matchResult.tree.spanned, [
					matchResult.tree,
				]),
			}
		: null
