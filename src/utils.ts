import type { MatchResult, SuccessResult } from './pattern'
import type { SpannedString } from './spanned-string'
import { Tree } from './tree'
import type { Span } from './types'

export const spanLength = (span: Span): number => span[1] - span[0]

export const escapeString = (str: string): string => {
	return str
		.replaceAll('\n', '\\n')
		.replaceAll('\r', '\\r')
		.replaceAll('\t', '\\t')
}

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

export const displayMatchResult = (matchResult: MatchResult) => {
	if (matchResult === null) return 'parse failed'

	let str = ''

	for (const [
		{ name, spanned },
		depth,
	] of matchResult.tree.iterLeftNamedWithDepth())
		str += `${'  '.repeat(depth)}${name ?? '(unnamed)'} (${spanned.span[0]} ${spanned.span[1]}) "${escapeString(spanned.window)}"\n`

	return str
}

export const spanHighlighterStream = (matchResult: MatchResult) => {
	if (matchResult === null) return

	let str = ``

	for (const {
		name,
		spanned: { span },
	} of matchResult.tree.iterLeftNamed())
		str += `${span[0]} ${span[1]} ${name}\n`

	return str
}
