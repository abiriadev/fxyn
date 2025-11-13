import {
	alt,
	repeat0,
	SpannedString,
	spanHighlighterStream,
	p,
	charNoneOfRepeat1,
	seq,
	type Pattern,
	charOneOf,
	negativeLookahead,
	renderMermaid,
} from '../src/index'

const ll = p('ll', '[[', true)
const rr = p('rr', ']]', true)

const specialCharacters = '[]'

const word = p('word', charNoneOfRepeat1(specialCharacters), true)

const special = charOneOf(specialCharacters)

let markup: Pattern

const linkInner = repeat0(alt(word, negativeLookahead(special, rr)))

const link = p('link', source => seq(ll, linkInner, rr)(source))

const markupBase = alt(link, word, special)

markup = p('markup', repeat0(markupBase))

// const raw = `제 1조. [[대한민국]]은 [[민주주의|민주]][[공화국]]이며`
const raw = `aaaa]] bdfjddfd [[  ajdfjak]  adfkaj  dafja [ dajfa ] 1]] dkjfa ]] kk [[ kjha`

const text = SpannedString.from(raw)

const parsed = markup(text)

if (parsed === null) throw new Error('parse failed')

console.log(spanHighlighterStream(parsed)?.trim())
// console.log(renderMermaid(parsed))
// console.log(
// 	renderMermaid({
// 		...parsed,
// 		tree: parsed.tree.projectToNamed(),
// 	}),
// )
