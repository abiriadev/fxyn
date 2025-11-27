import type { MatchResult, Pattern } from './pattern'
import type { SpannedString } from './spanned-string'
import { Tree } from './tree'
import type { Span } from './types'
import { mapValues } from 'es-toolkit'

export const spanLength = (span: Span): number => span[1] - span[0]

export const escapeString = (str: string): string => {
	return str
		.replaceAll('\n', '\\n')
		.replaceAll('\r', '\\r')
		.replaceAll('\t', '\\t')
}

export const rec = <T extends string>(
	recDef: Record<T, (pm: Record<T, Pattern>) => Pattern>,
): Record<T, Pattern> => {
	const patternMap = mapValues(
		recDef,
		patternFactory => (source: SpannedString) =>
			patternFactory(patternMap)(source),
	)

	return patternMap
}

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

	let str = matchResult.tree.spanned.source

	str += `\n${'='.repeat(10)}\n`

	for (const {
		name,
		spanned: { span },
	} of matchResult.tree.iterLeftNamed())
		str += `${span[0]} ${span[1]} ${name}\n`

	return str
}

const treeToMmdId = (tree: Tree) => `n_${tree.id}`

export const renderMermaid = (matchResult: MatchResult) => {
	if (matchResult === null) return

	let str = `flowchart TD\n`

	for (const [tree, depth] of matchResult.tree.iterLeftWithDepth()) {
		const nodeId = treeToMmdId(tree)
		const label = tree.name ?? '(unnamed)'
		str += `${nodeId}["${label}<br>(${tree.spanned.span[0]}, ${tree.spanned.span[1]})${tree.isTerminal
				? `<br><code>${tree.spanned.window.replaceAll(`"`, ``)}</code>`
				: ``
			}"]\n`

		for (const child of tree.children) {
			const childId = treeToMmdId(child)
			str += `${nodeId} --> ${childId}\n`
		}
	}

	return str
}
