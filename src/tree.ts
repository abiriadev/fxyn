import type { SpannedString } from './spanned-string'

export class Tree {
	name: string | null
	spanned: SpannedString
	children: Tree[]

	static newLeaf(spanned: SpannedString, name: string | null = null) {
		return new Tree(spanned, [], name)
	}

	constructor(
		spanned: SpannedString,
		children: Tree[],
		name: string | null = null,
	) {
		this.name = name
		this.spanned = spanned
		this.children = children
	}
}
