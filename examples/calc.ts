import { alt, assocBinLeftMap, match } from '@/combinators'
import { p, pMap } from '@/pattern-utils'
import { SpannedString } from '@/spanned-string'
import { rec, renderMermaid } from '@/utils'

const { expr } = rec({
	expr: $ => alt($.addsub),

	addsub: $ =>
		assocBinLeftMap(
			$.muldiv,
			[p('+', '+', true), pMap('add')],
			[p('-', '-', true), pMap('sub')],
		),

	muldiv: $ =>
		assocBinLeftMap(
			$.num,
			[p('*', '*', true), pMap('mul')],
			[p('/', '/', true), pMap('div')],
		),

	num: $ => p('num', match(/^-?(0|[1-9]\d*)/)),
})

const source = SpannedString.from(`1+2*3-4/5`)

const result = expr(source)
if (result === null) throw 1

console.log(
	renderMermaid({
		...result,
		tree: result.tree.projectToNamed(),
	}),
)
