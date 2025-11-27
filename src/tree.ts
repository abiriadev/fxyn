import { defaultIdGenerator, type IdGenerator } from './id-generator'
import type { SpannedString } from './spanned-string'

type Meta = Record<string, unknown>

export class Tree<T extends Meta = Meta> {
	id: number

	name: string | null
	spanned: SpannedString
	children: Tree<Meta>[]

	meta: T | null
	hidden: boolean

	static newTree<T extends Meta>(
		spanned: SpannedString,
		children: Tree<Meta>[],
		name: string | null = null,
		opt?: {
			hidden?: boolean
			idGenerator?: IdGenerator
			meta?: T
		},
	) {
		return new Tree<T>(
			(opt?.idGenerator ?? defaultIdGenerator).next(),
			name,
			spanned,
			children,
			opt?.hidden ?? false,
			opt?.meta ?? null,
		)
	}

	static newLeaf<T extends Meta>(
		spanned: SpannedString,
		name: string | null = null,
		opt?: {
			hidden?: boolean
			idGenerator?: IdGenerator
			meta?: T
		},
	) {
		return new Tree(
			(opt?.idGenerator ?? defaultIdGenerator).next(),
			name,
			spanned,
			[],
			opt?.hidden ?? false,
			opt?.meta ?? null,
		)
	}

	constructor(
		id: number,
		name: string | null,
		spanned: SpannedString,
		children: Tree<Meta>[],
		hidden: boolean,
		meta: T | null,
	) {
		this.id = id
		this.name = name
		this.spanned = spanned
		this.children = children
		this.hidden = hidden
		this.meta = meta
	}

	get isTerminal() {
		return this.children.length === 0
	}

	get isNamed() {
		return this.name !== null && !this.hidden
	}

	// create a new tree based on this tree with some fields replaced.
	extend({
		name = this.name,
		spanned = this.spanned,
		children = this.children,
		hidden = this.hidden,
		idGenerator = defaultIdGenerator,
	}: {
		name?: string | null
		spanned?: SpannedString
		children?: Tree<Meta>[]
		hidden?: boolean
		idGenerator?: IdGenerator
	}) {
		return Tree.newTree<T>(spanned, children, name, { hidden, idGenerator })
	}

	// dfs.
	// start visiting from the leftmost leaf, then go to right siblings, then go to parent.
	iterLeft(): Iterable<Tree<Meta>> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				for (const child of tree.children) yield* child.iterLeft()

				yield tree
			},
		}
	}

	iterLeftNamed(): Iterable<Tree<Meta>> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				const iter = tree.iterLeft()

				for (const tree of iter)
					if (tree.name !== null && !tree.hidden) yield tree
			},
		}
	}

	iterLeftWithDepth(): Iterable<[Tree<Meta>, number]> {
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

	iterLeftNamedWithDepth(): Iterable<[Tree<Meta>, number]> {
		const tree = this
		return {
			*[Symbol.iterator]() {
				const iter = tree.iterLeftWithDepth()

				for (const [tree, depth] of iter)
					if (tree.name !== null && !tree.hidden) yield [tree, depth]
			},
		}
	}

	projectToNamed(): Tree<T> {
		const children = []

		for (const child of this.children) {
			const projectedChild = child.projectToNamed()

			if (projectedChild.isNamed) children.push(projectedChild)
			else children.push(...projectedChild.children)
		}

		return this.extend({
			children,
		})
	}
}
