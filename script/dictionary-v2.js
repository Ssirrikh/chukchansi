
// 1.0 hrs: implement per-word indexing, begin applying to error checking and statistics
// 0.5 hrs: cleanup
// 4.0 hrs: move word indexing to discreet dictionaryUtils obj, bugfix, add duplication checking/stats
// 1.0 hrs: add filters to detect intended duplicate forms
// 2.0 hrs: formalize Language objects as class

(() => {
	//// private global methods ////

	const SYNONYM_SPLITTER = '; ';
	const ALPHABET_SPLITTER = ' ';

	//// Entry() shared methods ////

	function debugLabelSents (sForms,sentences) {
		let results = [];
		for (const sentence of sentences) {
			let labels = [];
			// discard non-alphanumeric characters and subscript from each sentence
			const words = sentence.secondary.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' '); // sterilize chars
			for (let formNum = 0; formNum < sForms.length; formNum++) {
				// if word doesn't have data for a form, skip it
				if (!sForms[formNum]) {
					// results.push(undefined);
					continue;
				}
				// else check if form is in sentence, accounting for multi-word forms
				for (const synonym of sForms[formNum]) {
					const form = synonym.toLowerCase().replace(/_.*/g,'');
					const numWords = form.split(' ').length;
					for (let i = 0; i < words.length-numWords+1; i++) {
						// console.log('"'+form+'" VS "'+words.slice(i,i+numWords).join(' ')+'"');
						if (words.slice(i,i+numWords).join(' ') == form) {
							// console.log('MATCH');
							labels.push(formNum);
						}
					}
				}
				
			}
			results.push(labels);
		}
		return results;

	}
	function getSynonyms (forms, word) {
		word = word.toLowerCase();
		for (const form of forms)
			if (form && form.some(x => x.toLowerCase() === word))
				return form.filter(x => x.toLowerCase() !== word);
		return [];
	}
	function getFormNum (forms, word) {
		word = word.toLowerCase();
		for (let formNum = 0; formNum < forms.length; formNum++)
			if (forms[formNum] && forms[formNum].some(x => x.toLowerCase() === word))
				return formNum;
		return -1;
	}
	function getSynonymID (forms, synonym) {
		synonym = synonym.toLowerCase();
		for (let formNum = 0; formNum < forms.length; formNum++)
			if (forms[formNum] && forms[formNum].some(x => x.toLowerCase() === synonym))
				return forms[formNum].indexOf(synonym);
		return -1;
	}
	function alphabetizeUnicode (a,b) {
		// alphabetization defaults to case-insensative unicode character order
		a = a.toLowerCase();
		b = b.toLowerCase();
		if (a > b) return 1;
		if (a < b) return -1;
		return 0;
	}

	//// Entry() ////

	class Language {
		constructor (name = 'New Language', abbreviation = 'lng', alphabet = '') {
			this.name = name;
			this.abbr = this.abbreviation = abbreviation;
			this.alphabet = this.alphabet.split(ALPHABET_SPLITTER);
			this.alphabetize = alphabetizeUnicode;
			this.usesForms = false;
			this.forms = {};
		}
		setCatgForms (catg, forms) {
			this.usesForms = true;
			for (let form of this.forms[catg]) {
				if (form) {
					console.warn(`Overwriting form names ${this.forms[catg]} -> ${forms}.`);
					break;
				}
			}
			this.forms[catg] = [];
			for (let form in forms) {
				this.forms[catg].push(form);
			}
		}
		addForm (catg, formNum, formName) {
			this.usesForms = true;
			if (!this.forms[catg]) {
				this.forms.catg = [];
			}
			if (this.forms[catg][formNum] && this.forms[catg][formNum] != formName) {
				console.warn(`Replacing ${catg} form ${formNum} "${this.forms[catg][formNum]}" with "${formName}" (${this.name}).`);
			}
			this.forms[catg][formNum] = formName;
		}
		getForm (catg, formNum) {
			if (this.forms[catg] && this.forms[catg][formNum]) {
				return this.forms[catg][formNum];
			} else {
				// return `Form ${formNum}`;
				return '';
			}
		}
		hasForm (catg, formNum) {
			return this.forms[catg] && this.forms[catg][formNum];
		}
	}

	// Entry() factory allows for private data and clean API, but uses more memory storing per-entry methods
	function Entry () {
		let pForms = [];
		let sForms = [];
		let sentences = [];
		let sentenceForms = [];
		return {
			// data
			catg : '',
			notes : '',
			// update
			// labelSents   : () => sentenceForms = getSentenceForms(sForms, sentences),
			// debugLabelSents : () => console.log('DBG',debugLabelSents(sForms,sentences)),
			labelSents   : () => sentenceForms = debugLabelSents(sForms,sentences),
			//
			addPrimary   : (synonymStr, formNum = pForms.length) => pForms[formNum] = synonymStr.split(SYNONYM_SPLITTER),
			addSecondary : (synonymStr, formNum = sForms.length) => sForms[formNum] = synonymStr.split(SYNONYM_SPLITTER),
			addSentence  : (primary, secondary) => sentences.push({primary:primary, secondary:secondary}),

			hasPrimary   : (word) => pForms.flat().some(x => x.toLowerCase()==word.toLowerCase()),
			hasSecondary : (word) => sForms.flat().some(x => x.toLowerCase()==word.toLowerCase()),

			getPrimary   : (formNum = 0) => pForms[formNum],
			getSecondary : (formNum = 0) => sForms[formNum],
			getSentence  : (sentenceNum) => sentences[sentenceNum],

			getPrimaryFormNum   : (word) => getFormNum(pForms, word),
			getSecondaryFormNum : (word) => getFormNum(sForms, word),

			getPrimarySynonyms : (word) => getSynonyms(pForms,word),
			getSecondarySynonyms : (word) => getSynonyms(sForms,word),

			getPrimarySynonymID : (synonym) => getSynonymID(pForms,synonym),
			getSecondarySynonymID : (synonym) => getSynonymID(sForms,synonym),

			forEachPrimaryForm : (callback = (synonyms,formNum)=>{}) => {
				for (let formNum = 0; formNum < pForms.length; formNum++)
					if (pForms[formNum])
						callback(pForms[formNum],formNum);
			},
			forEachSecondaryForm : (callback = (synonyms,formNum)=>{}) => {
				for (let formNum = 0; formNum < sForms.length; formNum++)
					if (sForms[formNum])
						callback(sForms[formNum],formNum);
			},
			forEachSentence : (callback = (sentence,sentenceForm,sentenceNum)=>{}) => {
				for (let sentNum = 0; sentNum < sentences.length; sentNum++)
					callback(sentences[sentNum],sentenceForms[sentNum],sentNum);
			}
		}
	}
	// Entry() class saves memory, but has messier API and no private data



	//// Dictionary() shared methods ////

	//// Dictionary() ////

	class Dictionary {
		constructor(primaryLang, secondaryLang) {
			// raw data (loaded post-init)
			this._data = [];
			// L1 parsed data
			this._pLang = primaryLang;
			this._pOrderedWords = [];
			this._pOrderedEntryWords = [];
			// L2 parsed data
			this._sLang = secondaryLang;
			this._sOrderedWords = [];
			this._sOrderedEntryWords = [];
			// settings
			this._togglePrimary = false;
			this._trimSearch = false;
			this._maxSearchResults = 10;
		}
	
		loadData(parse) {
			// parse format: {catg, sents[], pForms[[synonyms],...], sForms[[synonyms],...]}
			const P = this._pLang.abbr;
			const S = this._sLang.abbr;
			this._data = parse;
			// build ordered word lists
			this._pOrderedWords = [];
			this._sOrderedWords = [];
			for (let entryId = 0; entryId < this._data.length; entryId++) {
				this._data[entryId].forEachPrimaryForm((synonyms, formNum) => {
					for (const synonym of synonyms) this._pOrderedWords.push([synonym,entryId]);
				});
				this._data[entryId].forEachSecondaryForm((synonyms, formNum) => {
					for (const synonym of synonyms) this._sOrderedWords.push([synonym,entryId]);
				});
			}
			this._pOrderedWords.sort(this._pLang.alphabetize);
			this._sOrderedWords.sort(this._sLang.alphabetize);
			// build ordered entry lists
			this._pOrderedEntryWords = [];
			this._sOrderedEntryWords = [];
			for (let entryId = 0; entryId < this._data.length; entryId++) {
				// const pForm = this._data[entryId].getPrimaryForm(0);
				const pForm = this._data[entryId].getPrimary(0);
				for (let synonym of pForm) this._pOrderedEntryWords.push([synonym,entryId]);
				// const sForm = this._data[entryId].getSecondaryForm(0);
				const sForm = this._data[entryId].getSecondary(0);
				for (let synonym of sForm) this._sOrderedEntryWords.push([synonym,entryId]);
			}
			this._pOrderedEntryWords.sort(this._pLang.alphabetize);
			this._sOrderedEntryWords.sort(this._sLang.alphabetize);
		}
	
		get primary() { return (!this._togglePrimary) ? this._pLang.name : this._sLang.name; }
		get secondary() { return (!this._togglePrimary) ? this._sLang.name : this._pLang.name; }
		get abbr() { return (!this._togglePrimary) ? (this._pLang.abbr+'-'+this._sLang.abbr) : (this._sLang.abbr+'-'+this._pLang.abbr); }
		togglePrimary() { return (this._togglePrimary = !this._togglePrimary); }
	
		get maxSearchResults() { return this._trimSearch ? this._maxSearchResults : -1; }
		set maxSearchResults(n) { return this._maxSearchResults = parseInt(n); }
		get trimSearch() { return this._trimSearch; }
		toggleTrimSearch() { return this._trimSearch = !this._trimSearch; }
	
		searchWord(searchWord, lang = PRIMARY_LANG) {
			// sterilize input
			searchWord = searchWord.toLowerCase();
			if (lang != PRIMARY_LANG && lang != SECONDARY_LANG) return undefined;
			if (this._togglePrimary) lang = (lang==PRIMARY_LANG) ? SECONDARY_LANG : PRIMARY_LANG;
			// check if word exists, and return its entry if it does
			const orderedWords = (lang==PRIMARY_LANG) ? this._pOrderedWords : this._sOrderedWords;
			for (let wordRef of orderedWords) {
				const [word,index] = wordRef;
				if (word.toLowerCase() == searchWord) return this._data[index];
			}
			return false;
		}
		searchFragment(frag, lang = PRIMARY_LANG) {
			// sterilize input
			frag = frag.toLowerCase();
			if (lang != PRIMARY_LANG && lang != SECONDARY_LANG) return undefined;
			if (this._togglePrimary) lang = (lang==PRIMARY_LANG) ? SECONDARY_LANG : PRIMARY_LANG;
			// find first n words that begin with the given fragment
			const regex = new RegExp('^'+frag+'.*'); // start with fragment, than 0 or more of anything else
			const orderedWords = (lang==PRIMARY_LANG) ? this._pOrderedWords : this._sOrderedWords;
			const maxResults = this._trimSearch ? this._maxSearchResults : orderedWords.length;
			let results = [];
			for (const wordRef of orderedWords) {
				const [word,index] = wordRef;
				if (results.length == maxResults) return results;
				if (regex.test(word)) results.push(word);
			}
			return results;
		}
		forEachWord(callback = (entry,word)=>{}, reverse) {
			const orderedWords = (!this._togglePrimary) ? this._pOrderedWords : this._sOrderedWords;
			for (let i = 0; i < orderedWords.length; i++) {
				const [word,index] = !reverse ? orderedWords[i] : orderedWords[orderedWords.length-1 - i];
				callback(this._data[index], word);
			}
		}
		forEachSynonym (callback = (entry,synonym,entryIndex,synonymIndex)=>{}, reverse) {
			const orderedWords = (!this._togglePrimary) ? this._pOrderedEntryWords : this._sOrderedEntryWords;
			for (let i = 0; i < orderedWords.length; i++) {
				const [synonym,entryIndex] = !reverse ? orderedWords[i] : orderedWords[orderedWords.length-1 - i];
				const synonymIndex = (!this._togglePrimary) ? this._data[entryIndex].getPrimarySynonymID(synonym) : this._data[entryIndex].getSecondarySynonymID(synonym);
				callback(this._data[entryIndex], synonym, entryIndex, synonymIndex);
			}
		}
		forEachEntry(callback = (entry,index)=>{}, reverse) {
			for (let i = 0; i < this._data.length; i++) {
				callback(this._data[i], i);
			}
		}
	}

	//// utils ////

	// entry/sentence indexing:
		// group every occurence of a word spelling across all entries/wordforms (used to tag duplicates, homographs, etc)
		// tag every word in every example sentence with the entry it originates from
	function indexSecondaryWords (dictionary) {
		const t0_index = performance.now();
		let indexedWords = {};
		let numEntries = 0;
		dictionary.forEachEntry((entry,entryIndex) => {
			entry.forEachSecondaryForm((synonyms,formNum) => {
				for (let synonym of synonyms) {
					if (indexedWords[synonym] === undefined) { indexedWords[synonym] = { entries : [], sentences : [] }; }
					indexedWords[synonym].entries.push( [entryIndex,formNum] );
				}
			});
			entry.forEachSentence((sentence,sentenceForm,sentenceNum) => {
				// discard subscripts and non-alphanumeric characters from each sentence
				//// TODO: need to convert angled ' and ' to vertical '
				const words = sentence.secondary.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' '); // sterilize chars
				for (let i = 0; i < words.length; i++) {
					if (indexedWords[words[i]] === undefined) { indexedWords[words[i]] = { entries : [], sentences : [] }; }
					indexedWords[words[i]].sentences.push( [entryIndex,sentenceNum,i] );
				}
			});
			numEntries++;
		});
		console.log(`${Object.keys(indexedWords).length} secondary words from ${numEntries} entries indexed in ${performance.now()-t0_index} ms.`);
		return indexedWords;
	}
	function indexPrimaryWords (dictionary) {
		const t0_index = performance.now();
		let indexedWords = {};
		let numEntries = 0;
		dictionary.forEachEntry((entry,entryIndex) => {
			entry.forEachPrimaryForm((synonyms,formNum) => {
				for (let synonym of synonyms) {
					if (indexedWords[synonym] === undefined) { indexedWords[synonym] = { entries : [], sentences : [] }; }
					indexedWords[synonym].entries.push( [entryIndex,formNum] );
				}
			});
			entry.forEachSentence((sentence,sentenceForm,sentenceNum) => {
				// discard non-alphanumeric characters and subscript from each sentence
				//// TODO: need to convert angled ' and ' to vertical '
				const words = sentence.primary.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z ]/g, '').split(' '); // sterilize chars (no glottal stops in english)
				for (let i = 0; i < words.length; i++) {
					if (indexedWords[words[i]] === undefined) { indexedWords[words[i]] = { entries : [], sentences : [] }; }
					indexedWords[words[i]].sentences.push( [entryIndex,sentenceNum,i] );
				}
			});
			numEntries++;
		});
		console.log(`${Object.keys(indexedWords).length} primary words from ${numEntries} entries indexed in ${performance.now()-t0_index} ms.`);
		return indexedWords;
	}
	function listDuplicateEntries (indexedWords) {
		const t0_findDupes = performance.now();
		let duplicatedWords = [];
		let duplicatedEntries = [];
		// const hasAllSameForm = entries => {
		// 	let lastEntry;
		// 	for (let [entryIndex,formNum] of entries) {
		// 		if (lastEntry === undefined) {
		// 			lastEntry = 
		// 		}
		// 	}
		// };
		const reRootVowel = /^.*([aeiou])ʔ\1n$/gm; // root ending with vowel causes multiple forms to end in VʔVn
		const spansMultipleEntries = entries => {
			const [firstEntryIndex,firstForm] = entries[0];
			return entries.every(entry => {
				const [entryIndex,formNum] = entry;
				return entryIndex === firstEntryIndex;
			});
		}
		const multiEntryDupes = [];
		const singleEntryDupes = [];
		for (let word in indexedWords) {
			if (spansMultipleEntries(indexedWords[word].entries)) {
				multiEntryDupes.push([word,...])
			}
			if (indexedWords[word].entries.length > 1) {
				// object key guaranteed unique; word/entry arrays are coindexed
				duplicatedWords.push(word);
				duplicatedEntries.push(indexedWords[word].entries);
			}
		}
		console.log(`Found ${duplicatedWords.length} possible duplicates amongst ${Object.keys(indexedWords).length} total words, in ${performance.now()-t0_findDupes} ms.`);
		return {
			words : duplicatedWords,
			entries : duplicatedEntries
		};
	}
	function printEntries (indexedEntries,dictionary,primaryOrSecondary) {
		if (primaryOrSecondary !== 'primary' && primaryOrSecondary !== 'secondary') primaryOrSecondary = 'primary';
		const forEach = (primaryOrSecondary === 'primary') ? 'forEachPrimaryForm' : 'forEachSecondaryForm';
		let entries = [];
		for (let [entryIndex,formNumIndexed] of indexedEntries) {
			entries.push(dictionary._data[entryIndex]);
			dictionary._data[entryIndex][forEach]((synonyms,formNumEntry) => {
				if (formNumEntry == formNumIndexed) {
					console.log(`Entry ${entryIndex} wordform ${formNumEntry}: has ${primaryOrSecondary} synonyms [${synonyms.join(',')}].`);
				}
			});
		}
	}
	function getDuplicationStats (duplicates) {
        let numDuplicateForms = 0;
        let numDuplicateEntries = 0;
        
        for (let i = 0; i < duplicates.entries.length; i++) {
            let entryCounts = {};
            for (let [entryIndex,formNum] of duplicates.entries[i]) {
                if (!entryCounts[entryIndex]) entryCounts[entryIndex] = 0;
                entryCounts[entryIndex]++;
            }
            let hasDuplicateEntries = (Object.keys(entryCounts).length > 1); // dupe entries if more than one entry was flagged for current word
            let hasDuplicateForms = false;
            for (let entryIndex in entryCounts) {
                if (entryCounts[entryIndex] >= 2) hasDuplicateForms = true; // dupe forms if same entry was flagged more than once for current word
            }
            if (hasDuplicateEntries) numDuplicateEntries++;
            if (hasDuplicateForms) numDuplicateForms++;
        }

        return [numDuplicateForms,numDuplicateEntries];
    }



	//// public interface ////

	window.Language = Language; // bind class
	window.Entry = Entry; // bind factory
	window.Dictionary = Dictionary; // bind class
	window.dictionaryUtils = {
		indexPrimaryWords : indexPrimaryWords, // { word:{entries[entryIndex,formNum],sentences[entryIndex,sentenceIndex,wordIndex]}, ... }
		indexSecondaryWords : indexSecondaryWords, // { word:{entries[entryIndex,formNum],sentences[entryIndex,sentenceIndex,wordIndex]}, ... }
		listDuplicateEntries : listDuplicateEntries, // { words:[word1,word2,...], entries:[dupe1[occurence1[entryIndex,formNum],occurence2,...],dupe2[],...] }
		printEntries : printEntries, // void
		getDuplicationStats : getDuplicationStats, // [numDuplicateForms,numDuplicateEntries]
	};

})();



//// lang def ////

let L1_eng = new Language('English', 'eng', `a b c d e f g h i j k l m n o p q r s t u v w x y z`);
	// L1_eng.alphabetize = alphabetizeUnicode;
let L2_chk = new Language('Chukchansi', 'chk', `a b c d e f g h i j k l m n o p r s t u w x y ' ʔ`);
	L2_chk.setCatgForms('noun',				['subject', 'object', 'owner', 'owned', 'tool', 'place']);
	L2_chk.setCatgForms('adjective',		['subject', 'object', 'owner', 'owned', 'tool', 'place']);
	L2_chk.setCatgForms('demonstrative',	['subject', 'object', 'owner', 'owned', 'tool', 'place']);
	L2_chk.setCatgForms('verb',				['recent past', 'remote past', 'yesterday past', 'ongoing', 'command', 'suggestive', 'hypothetical', 'future', 'precedent gerundial', 'consequent gerundial']);
	L2_chk.setCatgForms('auxiliary verb',	['recent past', 'remote past', 'yesterday past', 'ongoing', 'command', 'suggestive', 'hypothetical', 'future', 'precedent gerundial', 'consequent gerundial']);
	L2_chk.setCatgForms('pronoun',			['subject', 'object']);
	// L2_chk.alphabetize = alphabetizeUnicode;



//// input parsing ////

const SEP_LINES = '\n';
const SEP_CELLS = '\t';

function parse_en_ch_v13 (tsv) {
	// input: "eng1   catg   chk1-10   sent1-10   bonusSent1-2   notes\n"
	// output: {catg, notes, pForms[[synonyms],...], sForms[[synonyms],...], sents[{eng,chk},...], sentForms[formNum,...]}

	let parse = [];

	const NUM_OF_FORMS = 10;
	const NUM_EXTRA_SENTS = 2;
	const FORM_START = 6;
	const SENT_START = FORM_START + NUM_OF_FORMS;
	const NOTES_START = SENT_START + 2*NUM_OF_FORMS + 2*NUM_EXTRA_SENTS;

	const entries = tsv.split(SEP_LINES);
	for (let i = 1; i < entries.length; i++) {
		const line = entries[i].split(SEP_CELLS); // 41 in v13: 1 eng word, 1 catg, [4 root/morpheme], 10 chk words, 24 sentences, 1 note

		// if (['blackberry','family','African-American'].indexOf( line[0].split(';')[0] ) == -1) continue; // DEBUG check of [standard,capitalization,synonyms]

		let e = Entry();
		// 0: eng forms
		e.addPrimary(line[0]);
		// 1: part of speech
		e.catg = line[1];
		// 2-5: root and morphemes
			// [skip]
		// 6-16: chk forms
		for (let formNum = 0; formNum < NUM_OF_FORMS; formNum++) {
			if (line[FORM_START+formNum] == '') continue;
			e.addSecondary(line[FORM_START+formNum], formNum);
		}
		// 17-40: sentences
		for (let sentenceNum = SENT_START; sentenceNum < NOTES_START; sentenceNum += 2) {
			const sentEngIndex = sentenceNum;
			const sentChkIndex = sentenceNum + 1;
			if (line[sentChkIndex] == '' && line[sentEngIndex] == '') continue;
			const sent = (line[sentChkIndex] != '') ? line[sentChkIndex] : ('[[no '+primary_eng.abbr3+' version of sentence]]');
			const sentTrans = (line[sentEngIndex]   != '') ? line[sentEngIndex]   : ('[[no '+secondary_chk.abbr3+' version of sentence]]');
			e.addSentence(sent, sentTrans);
		}
		// 41: entry notes
		e.notes= line[NOTES_START];
		// auto-detect forms in sentences
		e.labelSents();
		// log data
		parse.push(e);

		if (line[0].split(';')[0] == 'blackberry') {
			console.log('Test entry: "blackberry"');
			console.log(e);
		}
	}

	return parse;
}