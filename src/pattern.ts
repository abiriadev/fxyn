import { matchString } from './combinator'
import type { SpannedString } from './spanned-string'
import { Tree } from './tree'

export interface Pattern {
	(source: SpannedString): MatchResult
	p?: string
}

export type MatchResult = SuccessResult | null

export type SuccessResult = {
	tree: Tree
	consumed: number
	rest: SpannedString
}

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

type PatternLike = Pattern | string

export const toPattern = (from: PatternLike) =>
	typeof from === 'string' ? matchString(from) : from

// allow combinator to support `PatternLike` types, like raw string.
export const wrapPatternLike =
	<T extends Array<Pattern>, U>(combinator: (...patterns: T) => U) =>
	(...patternLikes: { [K in keyof T]: PatternLike }) =>
		combinator(...(patternLikes.map(toPattern) as T))
