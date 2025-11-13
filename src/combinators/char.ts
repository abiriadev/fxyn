import type { Pattern } from '@/pattern'
import { newLeafSuccessResult } from '@/pattern-utils'

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
