import type { Span } from './types'
import { spanLength } from './utils'

export class SpannedString {
	source: string
	span: Span

	static new(source: string, span: Span): SpannedString | null {
		// check
		if (span[0] < 0 || span[1] > source.length || spanLength(span) < 0)
			return null

		return new SpannedString(source, span)
	}

	static from(source: string): SpannedString {
		return new SpannedString(source, [0, source.length])
	}

	constructor(source: string, span: Span) {
		this.source = source
		this.span = span
	}

	get window() {
		return this.source.slice(this.span[0], this.span[1])
	}

	take(n: number) {
		// check
		if (n < 0 || spanLength(this.span) < n) return null

		return new SpannedString(this.source, [this.span[0], this.span[0] + n])
	}

	skip(n: number) {
		// check
		if (n < 0 || spanLength(this.span) < n) return null

		return new SpannedString(this.source, [this.span[0] + n, this.span[1]])
	}

	// produce epsilon
	takeNothing() {
		return new SpannedString(this.source, [this.span[0], this.span[0]])
	}

	slice(start: number, end: number) {
		// check
		if (start > end || start < 0 || end > spanLength(this.span)) return null

		return new SpannedString(this.source, [
			this.span[0] + start,
			this.span[0] + end,
		])
	}

	index(index: number) {
		return this.window[index]
	}

	get length() {
		return spanLength(this.span)
	}

	isEmpty() {
		return spanLength(this.span) === 0
	}

	// interop with template strings
	toString() {
		return this.window
	}
}
