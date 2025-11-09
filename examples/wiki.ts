import { alt, match, repeat0, until, SpannedString } from '../src/index'

const llbra = match('[[')
const rrbra = match(']]')

const word = until(']]')

const markupBase = alt(word, llbra, rrbra)

const markup = repeat0(markupBase)

const text = SpannedString.from(
	`제 1조. [[대한민국]]은 [[민주주의|민주]][[공화국]]이며`,
)

const parsed = markup(text)

console.log(parsed)
