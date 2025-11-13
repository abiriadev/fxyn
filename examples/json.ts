import { readFile } from 'node:fs/promises'
import {
	alt,
	char,
	charOneOfRepeat0,
	charRange,
	charRangeRepeat0,
	displayMatchResult,
	either,
	match,
	opt,
	p,
	rec,
	separatedBy0,
	seq,
	spanHighlighterStream,
	until,
} from '../src/index'
import { SpannedString } from '../src/spanned-string'

const nonZeroDigit = charRange('1', '9')

const zero = char('0')

const digit = either(zero, nonZeroDigit)
const digits = charRangeRepeat0('0', '9')

const matchNull = p('null', match('null'))
const matchTrue = p('true', match('true'))
const matchFalse = p('false', match('false'))
const matchBoolean = p('boolean', either(matchTrue, matchFalse), true)

const matchNumber = p(
	'number',
	seq(
		opt(char('-')),
		either(zero, seq(nonZeroDigit, digits)),
		opt(seq(char('.'), digits)),
	),
)
const matchString = p('string', seq(char('"'), until('"'), char('"')))

const ws = p('ws', charOneOfRepeat0('\n\r\t '), true)

const { matchArray, matchObject, matchValue, matchWsValue } = rec({
	matchArray: $ =>
		p(
			'array',
			seq(
				char('['),
				opt(separatedBy0($.matchWsValue, seq(char(',')))),
				char(']'),
			),
		),

	matchObject: $ =>
		p(
			'object',
			seq(
				char('{'),
				opt(
					separatedBy0(
						seq(ws, matchString, ws, char(':'), $.matchWsValue),
						seq(char(',')),
					),
				),
				char('}'),
			),
		),

	matchValue: $ =>
		p(
			'value',
			alt(
				matchNull,
				matchBoolean,
				matchNumber,
				matchString,
				$.matchArray,
				$.matchObject,
			),
			true,
		),

	matchWsValue: $ => seq(ws, $.matchValue, ws),
})

const jsonText = await readFile('./examples/demo.json', 'utf-8')

const source = SpannedString.from(jsonText)

const matchResult = matchWsValue(source)

console.log(displayMatchResult(matchResult))
console.log(spanHighlighterStream(matchResult)?.trim())
