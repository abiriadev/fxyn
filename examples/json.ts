import { readFile } from 'node:fs/promises'
import {
	alt,
	charOneOfRepeat0,
	either,
	match,
	p,
	rec,
	separatedBy0,
	seq,
	until,
	SpannedString,
	renderMermaid,
	spanHighlighterStream,
	braced,
	bracketed,
	enclosedBy,
} from '../src/index'

const matchNull = p('null', 'null')
const matchTrue = p('true', 'true')
const matchFalse = p('false', 'false')
const matchBoolean = p('boolean', either(matchTrue, matchFalse), true)

const matchNumber = p('number', /^-?(0|[1-9]\d*)(\.\d+)?/)
const matchString = p('string', enclosedBy(until('"'), '"'))

const ws = p('ws', charOneOfRepeat0('\n\r\t '), true)

const { matchArray, matchObject, matchValue, matchWsValue } = rec({
	matchArray: $ => p('array', bracketed(separatedBy0($.matchWsValue, ','))),

	matchObject: $ =>
		p(
			'object',
			braced(
				separatedBy0(
					seq(ws, matchString, ws, ':', $.matchWsValue),
					',',
				),
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
// const jsonText = await readFile('./package.json', 'utf-8')

const source = SpannedString.from(jsonText)

const matchResult = matchWsValue(source)

// console.log(displayMatchResult(matchResult))
if (!matchResult) throw 1

// console.log(
// renderMermaid({ ...matchResult, tree: matchResult.tree.projectToNamed() }),
// )
console.log(spanHighlighterStream(matchResult)?.trim())
