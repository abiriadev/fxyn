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
	separatedBy,
	seq,
	spanHighlighterStream,
	until,
} from '../src/index'
import { SpannedString } from '../src/spanned-string'

const nonZeroDigit = charOneOf('123456789')

const zero = char('0')

const digit = either(zero, nonZeroDigit)

const matchNull = p('matchNull', match('null'))
const matchTrue = p('matchTrue', match('true'))
const matchFalse = p('matchFalse', match('false'))
const matchBoolean = p('matchBoolean', either(matchTrue, matchFalse))

const matchNumber = p(
	'matchNumber',
	seq(
		opt(char('-')),
		either(zero, seq(nonZeroDigit, repeat0(digit))),
		opt(seq(char('.'), repeat0(digit))),
	),
)
const matchString = p('matchString', seq(char('"'), until('"'), char('"')))

const ws = p('ws', repeat0(charOneOf('\n\r\t ')))

let matchValue: Pattern = null!

const matchArray = p('matchArray', source =>
	seq(
		char('['),
		ws,
		opt(separatedBy(matchValue, seq(ws, char(','), ws))),
		ws,
		char(']'),
	)(source),
)

const matchObject = p('matchObject', source =>
	seq(
		char('{'),
		ws,
		opt(
			separatedBy(
				seq(matchString, ws, char(':'), ws, matchValue),
				seq(ws, char(','), ws),
			),
		),
		ws,
		char('}'),
	)(source),
)

matchValue = p(
	'matchValue',
	alt(
		matchNull,
		matchBoolean,
		matchNumber,
		matchString,
		matchArray,
		matchObject,
	),
)

const jsonText = await readFile('./examples/demo.json', 'utf-8')

const source = SpannedString.from(jsonText)

const matchResult = matchValue(source)

// console.log(displayMatchResult(matchResult))
console.log(spanHighlighterStream(matchResult)?.trim())
