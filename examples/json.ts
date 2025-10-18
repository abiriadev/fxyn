import { readFile } from 'node:fs/promises'
import {
	alt,
	displayMatchResult,
	IndexedString,
	match,
	oneOf,
	opt,
	p,
	Pattern,
	repeat0,
	separatedBy,
	seq,
	spanHighlighterStream,
	until,
} from '../src/index'

const nonZeroDigit = alt(
	match('1'),
	match('2'),
	match('3'),
	match('4'),
	match('5'),
	match('6'),
	match('7'),
	match('8'),
	match('9'),
)

const zero = match('0')

const digit = alt(zero, nonZeroDigit)

const matchNull = match('null')
const matchTrue = match('true')
const matchFalse = match('false')
const matchBoolean = alt(matchTrue, matchFalse)

const matchNumber = seq(
	opt(match('-')),
	alt(zero, seq(nonZeroDigit, repeat0(digit))),
	opt(seq(match('.'), repeat0(digit))),
)
const matchString = seq(match('"'), until('"'), match('"'))

const ws = repeat0(oneOf('\n\r\t '))

let matchValue: Pattern = null!

const matchArray = p('matchArray', source =>
	seq(
		match('['),
		ws,
		opt(separatedBy(matchValue, seq(ws, match(','), ws))),
		ws,
		match(']'),
	)(source),
)

const matchObject = p('matchObject', source =>
	seq(
		match('{'),
		ws,
		opt(
			separatedBy(
				seq(matchString, ws, match(':'), ws, matchValue),
				seq(ws, match(','), ws),
			),
		),
		ws,
		match('}'),
	)(source),
)

matchValue = p('matchValue', (source: IndexedString) =>
	alt(
		matchNull,
		matchBoolean,
		matchNumber,
		matchString,
		matchArray,
		matchObject,
	)(source),
)

const jsonText = await readFile('./examples/demo.json', 'utf-8')

const source: IndexedString = [jsonText, 0]

const matchResult = matchValue(source)

console.log(displayMatchResult(source, matchResult))
// console.log(spanHighlighterStream(matchResult))
