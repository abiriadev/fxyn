import type { SpannedString } from './spanned-string'
import type { Tree } from './tree'

export type MatchResult = SuccessResult | null

export type SuccessResult = {
	tree: Tree
	consumed: number
	rest: SpannedString
}

export interface Pattern {
	(source: SpannedString): MatchResult
	p?: string
}
