import { p, type MatchResult, type Pattern } from './pattern'

export const match = (lit: string) =>
	p('lit', ([source, index]) =>
		source.slice(index).startsWith(lit) ? lit.length : null,
	)

export const repeat0 = (pattern: Pattern) =>
	p('repeat0', source => {
		const matches: Array<MatchResult> = []

		while (true) {
			const match = pattern(source)
			if (match === null) return matches

			matches.push(match)
			source = match.rest
		}
	})

export const seq = (...patterns: Pattern[]) =>
	p('seq', source => {
		const matches: Array<MatchResult> = []

		for (const pattern of patterns) {
			const match = pattern(source)
			if (match === null) return null

			matches.push(match)
			source = match.rest
		}

		return matches
	})

export const alt = (...patterns: Pattern[]) =>
	p('alt', source => {
		for (const pattern of patterns) {
			const match = pattern(source)
			if (match !== null) return match
		}

		return null
	})

export const either = (pattern1: Pattern, pattern2: Pattern) =>
	p('either', source => {
		const match = pattern1(source)
		if (match !== null) return match

		return pattern2(source)
	})

export const opt = (pattern: Pattern) =>
	p('opt', source => {
		const match = pattern(source)
		return match === null ? 0 : match
	})

export const separatedBy = (item: Pattern, separator: Pattern) =>
	seq(item, repeat0(seq(separator, item)))

export const notChar = (char: string) => {
	if (char.length !== 1)
		throw new Error('notChar only accepts a single character')

	const pattern = match(char)

	return p('notChar', source => (pattern(source) === null ? 1 : null))
}

export const oneOf = (charClass: string) =>
	p('oneOf', source => alt(...charClass.split('').map(_ => match(_)))(source))

export const notOneOf = (charClass: string) =>
	p('notOneOf', ([source, index]) =>
		!source[index] || charClass.split('').includes(source[index])
			? null
			: 1,
	)

export const until = (char: string) => repeat0(notChar(char))
