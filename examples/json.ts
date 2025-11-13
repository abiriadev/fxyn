import { readFile } from 'node:fs/promises'
import {
	alt,
	charOneOfRepeat0,
	displayMatchResult,
	either,
	match,
	p,
	rec,
	separatedBy0,
	seq,
	until,
	SpannedString,
} from '../src/index'

const matchNull = p('null', 'null')
const matchTrue = p('true', 'true')
const matchFalse = p('false', 'false')
const matchBoolean = p('boolean', either(matchTrue, matchFalse), true)

const matchNumber = p('number', match(/^-?(0|[1-9]\d*)(\.\d+)?/))
const matchString = p('string', seq('"', until('"'), '"'))

const ws = p('ws', charOneOfRepeat0('\n\r\t '), true)

const { matchArray, matchObject, matchValue, matchWsValue } = rec({
	matchArray: $ =>
		p('array', seq('[', separatedBy0($.matchWsValue, seq(',')), ']')),

	matchObject: $ =>
		p(
			'object',
			seq(
				'{',
				separatedBy0(
					seq(ws, matchString, ws, ':', $.matchWsValue),
					',',
				),
				'}',
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
// console.log(spanHighlighterStream(matchResult)?.trim())
