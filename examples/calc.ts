import {
	alt,
	assocBinLeftMap,
	enclosedBy,
	mapSuccess,
	match,
	parenthesized,
	spTabNl0,
} from '@/combinators'
import { p, pMap } from '@/pattern-utils'
import { SpannedString } from '@/spanned-string'
import { rec, renderMermaid } from '@/utils'

const { expr } = rec({
	expr: $ => alt($.addsub),

	addsub: $ =>
		assocBinLeftMap($.muldiv, ['+', pMap('add')], ['-', pMap('sub')]),

	muldiv: $ =>
		assocBinLeftMap($.atom, ['*', pMap('mul')], ['/', pMap('div')]),

	atom: $ => enclosedBy(alt($.num, parenthesized($.expr)), spTabNl0),

	num: $ =>
		p(
			'num',
			mapSuccess(/^-?(0|[1-9]\d*)/, mr => {
				mr.tree.meta ??= {}
				mr.tree.meta.value = parseInt(mr.tree.spanned.window)

				return mr
			}),
		),
})

const source = SpannedString.from(`1 + 2 * -3 - 4 / 5 * (-6 + 11)`)

const result = expr(source)

if (result === null) throw 1

// console.log(
// 	renderMermaid({
// 		...result,
// 		tree: result.tree.projectToNamed(),
// 	}),
// )

const projectedTree = result.tree.projectToNamed()

for (const tree of projectedTree.iterLeft()) {
	if (tree.name === 'num') continue
	if (tree === projectedTree) {
		tree.meta = tree.meta ?? {}
		tree.meta.value = tree.children?.[0]?.meta?.value as number
		continue
	}

	const [lhs, rhs] = tree.children
	if (!lhs || !rhs) throw new Error(`invalid tree structure: ${tree.name}`)
	const lval = lhs.meta?.value as number
	const rval = rhs.meta?.value as number

	let value = 0

	if (tree.name === 'add') value = lval + rval
	else if (tree.name === 'sub') value = lval - rval
	else if (tree.name === 'mul') value = lval * rval
	else if (tree.name === 'div') value = lval / rval
	else throw new Error(`unknown operator: ${tree.name}`)

	tree.meta = tree.meta ?? {}
	tree.meta.value = value
}

console.log('result:', projectedTree.meta?.value)
