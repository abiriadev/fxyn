import { type Pattern } from './pattern'
import { Tree } from './tree'
import { newLeafSuccessResult, wrapSuccessResult } from './utils'

export const match =
	(lit: string): Pattern =>
	source =>
		source.window.startsWith(lit)
			? newLeafSuccessResult(source, lit.length)
			: null

export const repeat0 =
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
			tree: new Tree(source.take(consumed)!, children),
			consumed,
			rest,
		}
	}

export const repeat1 =
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
			tree: new Tree(source.take(consumed)!, children),
			consumed,
			rest,
		}
	}

export const seq =
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
			tree: new Tree(source.take(consumed)!, children),
			consumed,
			rest,
		}
	}

export const alt =
	(...patterns: Pattern[]): Pattern =>
	source => {
		for (const pattern of patterns) {
			const match = pattern(source)
			if (match !== null) return wrapSuccessResult(match)
		}

		return null
	}

export const either =
	(pattern1: Pattern, pattern2: Pattern): Pattern =>
	source => {
		const match1 = pattern1(source)
		if (match1 !== null) return wrapSuccessResult(match1)

		return wrapSuccessResult(pattern2(source))
	}

export const opt =
	(pattern: Pattern): Pattern =>
	source =>
		wrapSuccessResult(pattern(source)) ?? newLeafSuccessResult(source, 0)

export const separatedBy0 = (item: Pattern, separator: Pattern) =>
	seq(repeat0(seq(item, separator)), opt(item))

export const separatedBy1 = (item: Pattern, separator: Pattern) =>
	seq(item, repeat0(seq(separator, item)))

export const char = (char: string): Pattern => {
	if (char.length !== 1)
		throw new Error('char only accepts a single character')

	return source => {
		const sourceChar = source.index(0)

		// char always consumes one character. if the source is empty, the match fails
		if (sourceChar === undefined) return null
		if (sourceChar !== char) return null

		return newLeafSuccessResult(source, 1)
	}
}

export const notChar = (char: string): Pattern => {
	if (char.length !== 1)
		throw new Error('notChar only accepts a single character')

	return source => {
		const sourceChar = source.index(0)

		// notChar always consumes one character. if the source is empty, the match fails
		if (sourceChar === undefined) return null
		if (sourceChar === char) return null

		return newLeafSuccessResult(source, 1)
	}
}

export const charOneOf =
	(charClass: string): Pattern =>
	source => {
		const sourceChar = source.index(0)

		// charOneOf always consumes one character. if the source is empty, the match fails
		if (sourceChar === undefined) return null
		if (!charClass.split('').includes(sourceChar)) return null

		return newLeafSuccessResult(source, 1)
	}

export const charNoneOf =
	(charClass: string): Pattern =>
	source => {
		const sourceChar = source.index(0)

		// charNoneOf always consumes one character. if the source is empty, the match fails
		if (sourceChar === undefined) return null
		if (charClass.split('').includes(sourceChar)) return null

		return newLeafSuccessResult(source, 1)
	}

export const until =
	(endsWith: string): Pattern =>
	source => {
		const nextIndex = source.window.indexOf(endsWith)
		if (nextIndex === -1) return null
		return newLeafSuccessResult(source, nextIndex)
	}
