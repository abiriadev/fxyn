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

export const p = (name: string, pattern: Pattern, hidden = false) => {
	const namedPattern: Pattern = source => {
		const match = pattern(source)

		if (match === null) return null

		match.tree.name = name
		match.tree.hidden = hidden
		return match
	}

	namedPattern.p = name

	return namedPattern
}

export const toPattern = (from: string) => matchString(from)
