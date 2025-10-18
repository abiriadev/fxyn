import type { MatchResult } from './pattern'
import type { IndexedString, Tree } from './types'

export const displayMatchResult = (
	[source, index]: IndexedString,
	matchResult: MatchResult,
) => {
	if (matchResult === null) return 'parse failed'

	const sourceStr = source.slice(index)

	const rec = (tree: Tree, depth = 0) => {
		let str = ''
		const [[nodeName, start, end], children] = tree

		str += `${nodeName} (${start} ${end}) "${sourceStr.slice(start, end)}"\n`

		for (const child of children)
			str += `${'  '.repeat(depth)}${rec(child, depth + 1)}`

		return str
	}

	return rec(matchResult.tree)
}

export const spanHighlighterStream = (matchResult: MatchResult) => {
	if (matchResult === null) return

	const rec = (tree: Tree) => {
		const [[nodeName, start, end], children] = tree

		let str = `${start} ${end} ${nodeName}\n`

		for (const child of children) str += rec(child)

		return str
	}

	return rec(matchResult.tree)
}
