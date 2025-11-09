import { readFile } from 'node:fs/promises'
import {
	alt,
	char,
	charOneOf,
	displayMatchResult,
	either,
	match,
	opt,
	p,
	type Pattern,
	repeat0,
	separatedBy0,
	seq,
	spanHighlighterStream,
	until,
} from '../src/index'
import { SpannedString } from '../src/spanned-string'

const nonZeroDigit = charOneOf('123456789')

const zero = char('0')

const digit = either(zero, nonZeroDigit)

const matchNull = p('null', match('null'))
const matchTrue = p('true', match('true'))
const matchFalse = p('false', match('false'))
const matchBoolean = p('boolean', either(matchTrue, matchFalse), true)

const matchNumber = p(
	'number',
	seq(
		opt(char('-')),
		either(zero, seq(nonZeroDigit, repeat0(digit))),
		opt(seq(char('.'), repeat0(digit))),
	),
)
const matchString = p('string', seq(char('"'), until('"'), char('"')))

const ws = p('ws', repeat0(charOneOf('\n\r\t ')), true)

let matchWsValue: Pattern = null!

const matchArray = p('array', source =>
	seq(
		char('['),
		opt(separatedBy0(matchWsValue, seq(char(',')))),
		char(']'),
	)(source),
)

const matchObject = p('object', source =>
	seq(
		char('{'),
		opt(
			separatedBy0(
				seq(ws, matchString, ws, char(':'), matchWsValue),
				seq(char(',')),
			),
		),
		char('}'),
	)(source),
)

const matchValue = p(
	'value',
	alt(
		matchNull,
		matchBoolean,
		matchNumber,
		matchString,
		matchArray,
		matchObject,
	),
	true,
)

matchWsValue = seq(ws, matchValue, ws)

const jsonText = await readFile('./examples/demo.json', 'utf-8')

const source = SpannedString.from(jsonText)

const matchResult = matchWsValue(source)

console.log(displayMatchResult(matchResult))
console.log(spanHighlighterStream(matchResult)?.trim())
