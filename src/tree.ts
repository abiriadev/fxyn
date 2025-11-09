import type { SpannedString } from './spanned-string'

export class Tree {
	name: string | null

	spanned: SpannedString
	children: Tree[]

	hidden: boolean

	static newLeaf(spanned: SpannedString, name: string | null = null) {
		return new Tree(spanned, [], name)
	}

	constructor(
		spanned: SpannedString,
		children: Tree[],
		name: string | null = null,
		hidden = false,
	) {
		this.name = name
		this.spanned = spanned
		this.children = children
		this.hidden = hidden
	}

	// dfs.
	// start visiting from the leftmost leaf, then go to right siblings, then go to parent.
	iterLeft(): Iterable<Tree> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				for (const child of tree.children) yield* child.iterLeft()

				yield tree
			},
		}
	}

	iterLeftNamed(): Iterable<Tree> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				const iter = tree.iterLeft()

				for (const tree of iter)
					if (tree.name !== null && !tree.hidden) yield tree
			},
		}
	}

	iterLeftWithDepth(): Iterable<[Tree, number]> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				for (const child of tree.children)
					yield* Iterator.from(child.iterLeftWithDepth()).map(
						([t, d]) => [t, d + 1],
					)

				yield [tree, 0]
			},
		}
	}

	iterLeftNamedWithDepth(): Iterable<[Tree, number]> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				const iter = tree.iterLeftWithDepth()

				for (const [tree, depth] of iter)
					if (tree.name !== null && !tree.hidden) yield [tree, depth]
			},
		}
	}
}
