import type { Pattern } from '@/pattern'
import { newLeafSuccessResult } from '@/pattern-utils'
import {
	charOneOf,
	charRange,
	charRangeRepeat0,
	charRangeRepeat1,
} from './char'
import { either, repeat0, repeat1 } from './combinator'
import { match } from './match'

// static helpers

// matches to empty string
export const empty: Pattern = source => newLeafSuccessResult(source, 0)

export const eof: Pattern = source => {
	if (source.isEmpty()) return newLeafSuccessResult(source, 0)

	return null
}

export const digit = charRange('0', '9')

export const digits0 = charRangeRepeat0('0', '9')

export const digit1 = charRangeRepeat1('0', '9')

export const digitBin = charRange('0', '1')

export const digitOct = charRange('0', '7')

export const digitHexLower = match(/^[0-9a-f]/)

export const digitHexUpper = match(/^[0-9A-F]/)

export const digitHex = match(/^[\da-fA-F]/)

export const latinLower = charRange('a', 'z')

export const latinUpper = charRange('A', 'Z')

export const latin = either(latinLower, latinUpper)

export const crlf = either('\n', '\r\n')

export const spaceTabLf0 = repeat0(charOneOf(' \t\n'))

export const spaceTabLf1 = repeat1(charOneOf(' \t\n'))
