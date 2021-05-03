const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {

	/**
	 * It needs string to translate and it's language. This method will translate 
	 * that string to alternative string
	 * @param {String} str String to translate
	 * @param {Number} lang Language code in which given string is. 1 represents American and 0 represents British
	 * @returns {String} It returns translated string
	 */
	translateString(str, lang) {
		// Selecting list according to language code
		let title_list = lang ? americanToBritishTitles : this.flipObj(americanToBritishTitles);
		let spelling_list = lang ? americanToBritishSpelling : this.flipObj(americanToBritishSpelling);
		let phrase_list = lang ? americanOnly : this.flipObj(britishOnly);

		// Converting string
		str = this.translateSpellingAndPhrase(str, spelling_list, phrase_list);
		str = this.translateTitle(str, title_list);
		// Converting time
		str = lang ?
			str.replace(/(\d{1,2}):(\d{1,2})/g, this.addSpanTag('$1.$2')) :
			str.replace(/(\d{1,2})\.(\d{1,2})/, this.addSpanTag('$1:$2'));

		return this.getTitlecase(str);
	}

	/**
	 * This method will change title of string and then return it
	 * @param {String} str The string whose title is to be translated
	 * @param {{}} title_list Object which contains the translated titles
	 * @returns {String} Returns the translated string
	 */
	translateTitle(str, title_list) {
		for (const title of Object.keys(title_list))
			str = str.replace(this.getRegex(title), this.getReplacedString(this.getTitlecase(title_list[title])));

		return str;
	}

	/**
	 * This method will translate spelling and phrases of given string by matching 
	 * each word of str to the keys of spelling_list and phrase_list
	 * @param {String} str String which is to be translated
	 * @param {{}} spelling_list Object which contains the translated spelling
	 * @param {{}} phrase_list Object which contains the translated phrases
	 * @returns {String} Returns the translated string
	 */
	translateSpellingAndPhrase(str, spelling_list, phrase_list) {
		let words = str.toLowerCase().split(/\W+/);		// Spitting lowercase line into words
		words = [...new Set(words)];		// Deleting the duplicate words
		let phrase_keys = Object.keys(phrase_list);		// Getting all keys

		// Outer loop will find matching keys and replace it from the values in object
		// It uses brute force method to search each word in the given keys and then replace it
		for (const item of words) {
			let phrase_found = this.findKey(item, phrase_keys);		// Searching phrases
			// Replacing matched phrase
			for (const phrase of phrase_found)
				str = str.replace(this.getRegex(phrase), this.getReplacedString(phrase_list[phrase]));

			// Replacing spellings
			const found_spelling = spelling_list[item];
			if (found_spelling)
				str = str.replace(this.getRegex(item), this.getReplacedString(found_spelling));
		}
		return str;
	}

	/**
	 * Find if any key in given array (list key) starts with string (to_search)
	 * @param {String} to_search key which is to be searched
	 * @param {Array} list_key List in which the key is to be searched
	 * @returns {Array} Return the array of found keys
	 */
	findKey(to_search, list_key) {
		let resultArray = [];
		to_search = to_search.toLowerCase();

		// Implementing binary search to search if any key starts with the given
		// to_search string using regex and then return that matching key.
		let start = 0;
		let end = list_key.length - 1;
		let mid = Math.floor((list_key.length - 1) / 2);

		// Creating regex to search if any key starts to_search string
		let myRegex = new RegExp('^' + to_search);

		while (start < end) {

			if (myRegex.test(list_key[mid])) {
				resultArray.push(list_key[mid]);
				list_key.splice(mid, 1);
				start = 0;
				end = list_key.length - 1;
			}
			else if (to_search > list_key[mid]) start = mid + 1;
			else end = mid - 1;

			mid = Math.floor((start + end) / 2);
		}
		if (myRegex.test(list_key[mid])) resultArray.push(list_key[mid]);

		return resultArray;
	}

	// This method will add span to the given string
	addSpanTag = str => `<span class='highlight'>${str}</span>`;

	// This method will add span tag and some regex things to the string, then return it
	getReplacedString = str => `$1${this.addSpanTag(str)}$2`;

	// This method will return regex expression which is required
	getRegex = str => new RegExp(`(^|[^a-z])${str}([^a-z]|$)`, 'gi');

	// This method flips the object, i.e. key becomes values and vice versa
	flipObj(obj) {
		const ret = {};
		Object.keys(obj).forEach(key => ret[obj[key]] = key);
		return ret;
	}

	// This method will convert first letter of string to uppercase
	getTitlecase = str => str[0].toUpperCase() + str.slice(1,);
}

module.exports = Translator;