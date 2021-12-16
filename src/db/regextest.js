const urlTwtIdRE = new RegExp(/(?:\/)(\d+)(?:\/|\?|$)/)
const twtIdRE = new RegExp(/^\d+$/)

function parseTweetId(string) {
	if (urlTwtIdRE.test(string)) {
		return string.match(urlTwtIdRE)[1]
	}
	if (twtIdRE.test(string)) {
		return string.match(twtIdRE)[0]
	}
	return false
}

console.log(
	parseTweetId(
		'asd1471087686937374722?s=20'
	)
)