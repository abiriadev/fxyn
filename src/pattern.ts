import type { IndexedString, Tree } from './types'

export type RawPattern = (
	source: IndexedString,
) => number | MatchResult[] | MatchResult | null

export type MatchResult = { tree: Tree; consumed: number; rest: IndexedString }

export type Pattern = (source: IndexedString) => MatchResult | null

export const p = (name: string, rawPattern: RawPattern): Pattern => {
	return ([source, index]) => {
		const match = rawPattern([source, index])

		if (match === null) return null
		if (typeof match === 'number')
			return {
				tree: [[name, index, index + match], []],
				consumed: match,
				rest: [source, index + match],
			}
		if (!Array.isArray(match)) return match

		const trees = match.map(({ tree }) => tree)
		const newIndex = trees.at(-1)?.[0]?.[2] ?? index

		return {
			tree: [[name, index, newIndex], trees],
			consumed: newIndex - index,
			rest: [source, newIndex],
		}
	}
}
