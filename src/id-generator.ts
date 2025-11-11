// globally unique Tree id generator
export class IdGenerator {
	#nextId: number = 1

	constructor() {}

	next() {
		return this.#nextId++
	}

	// iterator compatible interface
	*sequence() {
		while (true)
			// for multiple access. don't use ++ here.
			yield this.#nextId++
	}
}

export const defaultIdGenerator = new IdGenerator()
