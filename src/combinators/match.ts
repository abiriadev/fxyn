import type { Pattern } from '@/pattern'
import { newLeafSuccessResult } from '@/pattern-utils'

export const match = (pattern: string | RegExp) =>
	typeof pattern === 'string' ? matchString(pattern) : matchRegex(pattern)

export const matchString =
	(lit: string): Pattern =>
	source =>
		source.window.startsWith(lit)
			? newLeafSuccessResult(source, lit.length)
			: null

export const matchRegex = (re: RegExp): Pattern => {
	if (!re.source.startsWith('^')) {
		throw new Error('matchRegex only accepts regex starting with ^')
	}

	return source => {
		const match = re.exec(source.window)
		if (match === null) return null

		const [matched] = match

		return newLeafSuccessResult(source, matched.length)
	}
}
