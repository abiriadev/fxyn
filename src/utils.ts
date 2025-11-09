import type { MatchResult } from './pattern'
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
export const newLeafMatchResult = (
	source: SpannedString,
	consumed: number,
) => ({
	tree: Tree.newLeaf(source.take(consumed)!),
	consumed,
	rest: source.skip(consumed)!,
})

export const displayMatchResult = (matchResult: MatchResult) => {
	if (matchResult === null) return 'parse failed'

	const rec = (tree: Tree, depth = 0) => {
		let str = ''

		const { name, children, spanned } = tree

		str += `${name ?? '(unnamed)'} (${spanned.span[0]} ${spanned.span[1]}) "${escapeString(spanned.window)}"\n`

		for (const child of children)
			str += `${'  '.repeat(depth)}${rec(child, depth + 1)}`

		return str
	}

	return rec(matchResult.tree)
}

export const spanHighlighterStream = (matchResult: MatchResult) => {
	if (matchResult === null) return

	const rec = (tree: Tree) => {
		const {
			name,
			spanned: { span },
			children,
		} = tree

		let str = `${span[0]} ${span[1]} ${name}\n`

		for (const child of children) str += rec(child)

		return str
	}

	return rec(matchResult.tree)
}
