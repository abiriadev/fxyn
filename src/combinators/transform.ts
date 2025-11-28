import type {
	ErrorResult,
	MatchResult,
	Pattern,
	SuccessResult,
} from '@/pattern'
import { toPattern, type PatternLike } from '@/pattern-utils'

export const map = (
	pattern: PatternLike,
	mapper: (matchResult: MatchResult) => MatchResult,
): Pattern => {
	const _pattern = toPattern(pattern)

	return source => mapper(_pattern(source))
}

export const mapSuccess = (
	pattern: PatternLike,
	mapper: (successResult: SuccessResult) => MatchResult,
): Pattern => {
	const _pattern = toPattern(pattern)

	return source => {
		const matchResult = _pattern(source)
		if (matchResult === null) return null

		return mapper(matchResult)
	}
}

export const mapError = (
	pattern: PatternLike,
	mapper: (errorResult: ErrorResult) => MatchResult,
): Pattern => {
	const _pattern = toPattern(pattern)

	return source => {
		const matchResult = _pattern(source)
		if (matchResult !== null) return matchResult

		return mapper(matchResult)
	}
}
