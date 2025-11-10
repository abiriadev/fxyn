import { type Pattern } from './pattern'
import { Tree } from './tree'
import { newLeafSuccessResult, wrapSuccessResult } from './utils'

declare global {
	interface RegExpConstructor {
		escape(str: string): string
	}
}

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

export const charRepeat0 = (char: string): Pattern => {
	if (char.length !== 1)
		throw new Error('charRepeat0 only accepts a single character')

	const re = new RegExp(`^${RegExp.escape(char)}*`)

	return source => {
		// NOTE: it can't be null
		const [matched] = re.exec(source.window)!

		return newLeafSuccessResult(source, matched.length)
	}
}

export const charRepeat1 = (char: string): Pattern => {
	if (char.length !== 1)
		throw new Error('charRepeat1 only accepts a single character')

	const re = new RegExp(`^${RegExp.escape(char)}+`)

	return source => {
		const match = re.exec(source.window)
		if (match === null) return null

		const [matched] = match

		return newLeafSuccessResult(source, matched.length)
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

export const notCharRepeat0 = (char: string): Pattern => {
	if (char.length !== 1)
		throw new Error('notCharRepeat0 only accepts a single character')

	const re = new RegExp(`^[^${RegExp.escape(char)}]*`)

	return source => {
		// NOTE: it can't be null
		const [matched] = re.exec(source.window)!

		return newLeafSuccessResult(source, matched.length)
	}
}

export const notCharRepeat1 = (char: string): Pattern => {
	if (char.length !== 1)
		throw new Error('notCharRepeat1 only accepts a single character')

	const re = new RegExp(`^[^${RegExp.escape(char)}]+`)

	return source => {
		const match = re.exec(source.window)
		if (match === null) return null

		const [matched] = match

		return newLeafSuccessResult(source, matched.length)
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

export const charOneOfRepeat0 = (charClass: string): Pattern => {
	const re = new RegExp(`^[${RegExp.escape(charClass)}]*`)

	return source => {
		// NOTE: it can't be null
		const [matched] = re.exec(source.window)!

		return newLeafSuccessResult(source, matched.length)
	}
}

export const charOneOfRepeat1 = (charClass: string): Pattern => {
	const re = new RegExp(`^[${RegExp.escape(charClass)}]+`)

	return source => {
		const match = re.exec(source.window)
		if (match === null) return null

		const [matched] = match

		return newLeafSuccessResult(source, matched.length)
	}
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

export const charNoneOfRepeat0 = (charClass: string): Pattern => {
	const re = new RegExp(`^[^${RegExp.escape(charClass)}]*`)

	return source => {
		// NOTE: it can't be null
		const [matched] = re.exec(source.window)!

		return newLeafSuccessResult(source, matched.length)
	}
}

export const charNoneOfRepeat1 = (charClass: string): Pattern => {
	const re = new RegExp(`^[^${RegExp.escape(charClass)}]+`)

	return source => {
		const match = re.exec(source.window)
		if (match === null) return null

		const [matched] = match

		return newLeafSuccessResult(source, matched.length)
	}
}

export const charRange = (from: string, to: string): Pattern => {
	if (from.length !== 1 || to.length !== 1)
		throw new Error(
			'charRange only accepts single characters as from and to',
		)

	const fromCode = from.charCodeAt(0)
	const toCode = to.charCodeAt(0)

	if (fromCode > toCode)
		throw new Error(
			'charRange from character must be less than to character',
		)

	return source => {
		const sourceChar = source.index(0)

		// charRange always consumes one character. if the source is empty, the match fails
		if (sourceChar === undefined) return null

		const sourceCode = sourceChar.charCodeAt(0)
		if (!(fromCode <= sourceCode && sourceCode <= toCode)) return null

		return newLeafSuccessResult(source, 1)
	}
}

export const charRangeRepeat0 = (from: string, to: string): Pattern => {
	if (from.length !== 1 || to.length !== 1)
		throw new Error(
			'charRangeRepeat0 only accepts single characters as from and to',
		)

	const fromCode = from.charCodeAt(0)
	const toCode = to.charCodeAt(0)

	if (fromCode > toCode)
		throw new Error(
			'charRangeRepeat0 from character must be less than to character',
		)

	const re = new RegExp(
		`^[${String.fromCharCode(fromCode)}-${String.fromCharCode(toCode)}]*`,
	)

	return source => {
		// NOTE: it can't be null
		const [matched] = re.exec(source.window)!

		return newLeafSuccessResult(source, matched.length)
	}
}

export const charRangeRepeat1 = (from: string, to: string): Pattern => {
	if (from.length !== 1 || to.length !== 1)
		throw new Error(
			'charRangeRepeat1 only accepts single characters as from and to',
		)

	const fromCode = from.charCodeAt(0)
	const toCode = to.charCodeAt(0)

	if (fromCode > toCode)
		throw new Error(
			'charRangeRepeat1 from character must be less than to character',
		)

	const re = new RegExp(
		`^[${String.fromCharCode(fromCode)}-${String.fromCharCode(toCode)}]+`,
	)

	return source => {
		const match = re.exec(source.window)
		if (match === null) return null

		const [matched] = match

		return newLeafSuccessResult(source, matched.length)
	}
}

export const until =
	(endsWith: string): Pattern =>
	source => {
		const nextIndex = source.window.indexOf(endsWith)
		if (nextIndex === -1) return null
		return newLeafSuccessResult(source, nextIndex)
	}

export const eof: Pattern = source => {
	if (source.isEmpty()) return newLeafSuccessResult(source, 0)

	return null
}

export const lookahead =
	(pattern: Pattern, lookahead: Pattern): Pattern =>
	source => {
		const lookaheadMatch = lookahead(source)
		if (lookaheadMatch === null) return null

		return pattern(source)
	}

export const negativeLookahead =
	(pattern: Pattern, lookahead: Pattern): Pattern =>
	source => {
		const lookaheadMatch = lookahead(source)
		if (lookaheadMatch !== null) return null

		return pattern(source)
	}
