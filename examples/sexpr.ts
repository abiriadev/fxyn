import {
	alt,
	char,
	charOneOfRepeat0,
	p,
	rec,
	repeat0,
	seq,
	SpannedString,
	until,
	match,
	spanHighlighterStream,
	renderMermaid,
} from '../src/index'

const number = p('number', match(/^-?(0|[1-9]\d*)(\.\d+)?/))

const string = p('string', seq(char('"'), until('"'), char('"')))

// scheme style ident
const ident = p(
	'ident',
	match(/^[a-zA-Z!$%&*+\-./:<=>?@^_~][\da-zA-Z!$%&*+\-./:<=>?@^_~]*/),
)

const atom = alt(number, string, ident)

const ws = p('ws', charOneOfRepeat0('\n\r\t '), true)

const { list, value, valueWs } = rec({
	list: $ => p('list', seq(char(`(`), repeat0($.valueWs), char(`)`))),

	value: $ => alt(atom, $.list),

	valueWs: $ => seq(ws, $.value, ws),
})

const raw = `
(define (factorial n)
  (if (<= n 1)
	  1
	  (* n (factorial (- n 1)))))
`.trim()

const text = SpannedString.from(raw)

const matched = valueWs(text)

// console.log(displayMatchResult(match))
// console.log(spanHighlighterStream(matched)?.trim())
console.log(
	renderMermaid({
		...matched!,
		tree: matched!.tree.projectToNamed(),
	})?.trim(),
)
