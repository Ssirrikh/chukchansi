
//// WAVE 1 ////

// 2.0 hrs: design language data representation format; start v3 parser
// 0.5 hrs: finish v3 parser
// 0.5 hrs: lay out skeleton of dictionary framework update
// 2.0 hrs: fix v3 parser bugs, update custom sort, finish data loading
// 1.5 hrs: update search
// 0.5 hrs: finish v4 parser
// 1.5 hrs: start updating speaking dictionary
// 2.0 hrs: start refactor of v4 parser and dictionary framework to be more efficient and include new built-in operations
// 1.0 hrs: finish refactor of v4 parser and dictionary framework
// 1.0 hrs: finish updating speaking dictionary
// 0.5 hrs: add new batch of sounds/images to speaking dictionary

//// WAVE 2 ////

// 1.5 hrs: spreadsheet fixes in prep for v9, implement Dictionary.forEachEntry, fix Entry.primarySynonymID
// 0.5 hrs: add ability to search formNum of word in an entry

//// WAVE 3 ////

// 1.0 hrs: add v10 parser; supports 2 extra sentences, entry notes, and automatic sentence form detection
// 2.5 hrs: use map-filter to make automatic form detection GC-proof; begin dev IIFE refactor
// 3.5 hrs: finish IIFE refactor
// 0.5 hrs: fix getSentenceForms() failing to correctly auto-label sentences; fix getFormNum() always returning 0 for valid words
// 0.5 hrs: fix auto sentence form detection not handling capitalized words correctly
// 1.0 hrs: fix getSynonyms() sometimes throwing error; fully test IIFE Entry(); minor spreadsheet fixes
// 1.0 hrs: spreadsheet fixes and voice synth dev
// 0.5 hrs: add v12 parser (support root/morpheme data); spreadsheet fixes
// 2.0 hrs: add support for multi-word forms when auto-labeling sentences; minor related bugfixes
// 0.5 hrs: add v13 parser (more root/morpheme data; new form)

const SEP_LINES = '\n';
const SEP_CELLS = '\t';
const SEP_SYNONYMS = '; ';
const SEP_ALPHABET = ' ';

let primary_eng = {
	name: 'English',
	abbr: 'en',
	abbr3: 'eng',
	alphabet: `a b c d e f g h i j k l m n o p q r s t u v w x y z`.split(SEP_ALPHABET),
	alphabetize: (a,b) => {
		a = a[0].toLowerCase();
		b = b[0].toLowerCase();
		if (a > b) return 1;
		if (a < b) return -1;
		return 0;
	},
	forms: {
		// default: (i) => 'form '+i
		default: (i) => ''
	},
	formStr: (catg,i) => {
		return (primary_eng.forms.hasOwnProperty(catg) && i < primary_eng.forms[catg].length)
			? primary_eng.forms[catg][i]
			: primary_eng.forms.default(i)
	}
};

let secondary_chk = {
	name: 'Chukchansi',
	abbr: 'ch',
	abbr3: 'chk',
	// alphabet: `b c d f g h j k l m n p q r s t v w x y z ʔa ʔe ʔi ʔo ʔu`.split(' '),
	// alphabet: `a aa b ch ch' d e ee f g h i ii j k k' l l' m m' n n' o oo p p' r s sh t t' u uu w w' x y y' ʔ`.split(' '),
	alphabet: `a b c d e f g h i j k l m n o p r s t u w x y ' ʔ`.split(SEP_ALPHABET),
	alphabetize: (a,b) => { // piggy-back off unicode char order for now
		a = a[0].toLowerCase();
		b = b[0].toLowerCase();
		if (a > b) return 1;
		if (a < b) return -1;
		return 0;
	},
	forms: {
		'noun'           : ['subject', 'object', 'owner', 'owned',   'tool',    'place'],
		'adjective'      : ['subject', 'object', 'owner', 'owned',   'tool',    'place'],
		'demonstrative'  : ['subject', 'object', 'owner', 'owned',   'tool',    'place'],
		'verb'           : ['recent past', 'remote past', 'yesterday past', 'ongoing', 'command', 'suggestive', 'hypothetical', 'future', 'precedent gerundial', 'consequent gerundial'],
		'auxiliary verb' : ['recent past', 'remote past', 'yesterday past', 'ongoing', 'command', 'suggestive', 'hypothetical', 'future', 'precedent gerundial', 'consequent gerundial'],
		'pronoun'        : ['subject', 'object'],
		// default: (i) => 'form '+i
		default: (i) => ''

		// 'n': ['subject', 'object', 'possessive',     'possessed', 'instrumental', 'locative'],
		// 'v': ['subject', 'object', 'yesterday past', 'ongoing',   'command',      'hypothetical', 'future']
		// precedent gerundial of "arrived": "He arrived when I was eating." [did precedent gerundial during main action]
	},
	formStr: (catg,i) => {
		return (secondary_chk.forms.hasOwnProperty(catg) && i < secondary_chk.forms[catg].length)
			? secondary_chk.forms[catg][i]
			: secondary_chk.forms.default(i)
	},
	hasForm: (catg,i) => {
		if (!secondary_chk.forms[catg]) return false;
		if (i && !secondary_chk.forms[catg][i]) return false;
		return true;
	}
};

function BlankEntry() {
	const EN = primary_eng.abbr;
	const CH = secondary_chk.abbr;
	let e = {
		catg: undefined,
		sents: {},
		forms: {}
	};
	e.sents[EN] = [];
	e.sents[CH] = [];
	e.forms[EN] = [];
	e.forms[CH] = [];
	return e;
}

/////////////////////////////////////

function parse_en_ch_v1(tsv) {
	console.log('v1 parse stub');
}

function parse_en_ch_v3(tsv) {
	// input: "eng1   catg   sent1_ch sent1_en sent_ch sent2_en   chk1 chk2 ...\n"
	// output: {catg, sents{en[s1,...],ch[s1,...]}, forms{en[[f_num,[synonyms]],...],ch[[]]}}
	const EN = primary_eng.abbr;
	const CH = secondary_chk.abbr;

	let parse = [];

	const entries = tsv.split('\n');
	for (let i = 0; i < entries.length; i++) {
		const line = entries[i].split('	'); // 13 in v3: 1 eng word, 1 catg, 4 sentences, 7 chk words
		let e = BlankEntry();
		// part of speech
		e.catg = line[1];
		// sentences
		e.sents[CH].push( [0, line[2]] );
		e.sents[EN].push( [0, line[3]] );
		e.sents[CH].push( [1, line[4]] );
		e.sents[EN].push( [1, line[5]] );
		// eng forms
		e.forms[EN].push( [0, line[0].split('; ')] );
		// chk forms
		for (let formNum = 0; formNum < line.length-6; formNum++) {
			if (line[6+formNum] == '') continue;
			e.forms[CH].push( [formNum, line[6+formNum].split('; ')] );
		}
		// log data
		parse.push(e);
	}

	return parse;
}

function parse_en_ch_v4(tsv) {
	// input: "eng1   catg   sent1_ch sent1_en sent_ch sent2_en   chk1 chk2 ...\n"
	// output: {catg, sents[], pForms[[synonyms],...], sForms[[synonyms],...]}

	let parse = [];

	const entries = tsv.split('\n');
	for (let i = 0; i < entries.length; i++) {
		const line = entries[i].split('	'); // 23 in v4: 1 eng word, 1 catg, 14 sentences, 7 chk words
		let e = new Entry();
		// part of speech
		e.catg = line[1];
		// sentences
		for (let sentenceNum = 0; sentenceNum < 7; sentenceNum++) {
			let sentTransIndex = 2 + 2*sentenceNum;
			let sentIndex = sentTransIndex + 1;
			if (line[sentIndex] == '' && line[sentTransIndex] == '') continue;
			let sent = (line[sentIndex] != '') ? line[sentIndex] : ('[[no '+primary_eng.abbr3+' version of sentence]]');
			let sentTrans = (line[sentTransIndex]   != '') ? line[sentTransIndex]   : ('[[no '+secondary_chk.abbr3+' version of sentence]]');
			e.addSentence(sent, sentTrans, sentenceNum);
		}
		// eng forms
		e.addPrimaryForm(line[0]);
		// chk forms
		for (let formNum = 0; formNum < line.length-16; formNum++) {
			if (line[16+formNum] == '') continue;
			e.addSecondaryForm(line[16+formNum], formNum);
		}
		// log data
		parse.push(e);
	}

	return parse;
}

function parse_en_ch_v8(tsv) {
	// input: "eng   catg   chk[1...8]   sent1_ch sent1_en   sent2_ch sent2_en   ...\n"
	// output: {catg, sents[], pForms[[synonyms],...], sForms[[synonyms],...]}

	let parse = [];

	const FORM_START = 2;
	const SENT_START = 10;

	const entries = tsv.split('\n');
	for (let i = 0; i < entries.length; i++) {
		const line = entries[i].split('	');
		let e = new Entry();
		// part of speech
		e.catg = line[1];
		// eng forms
		e.addPrimaryForm(line[0]);
		// chk forms
		for (let formNum = 0; formNum < SENT_START-FORM_START; formNum++) {
			if (line[FORM_START+formNum] == '') continue;
			e.addSecondaryForm(line[FORM_START+formNum], formNum);
		}
		// sentences
		for (let sentNum = 0; sentNum < line.length-SENT_START; sentNum += 2) {
			if (line[SENT_START+sentNum] == '') continue;
			e.addSentence(line[SENT_START+sentNum+1], line[SENT_START+sentNum]); // chk,eng from data -> eng,chk in func
		}
		// log data
		parse.push(e);
	}

	return parse;
}

function parse_en_ch_v9 (tsv) { //// parse for dictionary.js v1.x!!! need to make equivalent parse for v2.x in the future
	// input: "eng1   catg   chk1-7   sent1-7\n"
	// output: {catg, sents[], pForms[[synonyms],...], sForms[[synonyms],...]}

	let parse = [];

	const NUM_OF_FORMS = 9;
	const FORM_START = 2;
	const SENT_START = 2 + NUM_OF_FORMS;

	const entries = tsv.split(SEP_LINES);
	for (let i = 0; i < entries.length; i++) {
		const line = entries[i].split(SEP_CELLS); // 26 in v9: 1 eng word, 1 catg, 8 chk words, 16 sentences 
		let e = new Entry();
		// 0: eng forms
		e.addPrimaryForm(line[0]);
		// 1: part of speech
		e.catg = line[1];
		// 2-10: chk forms
		for (let formNum = 0; formNum < NUM_OF_FORMS; formNum++) {
			if (line[FORM_START+formNum] == '') continue;
			e.addSecondaryForm(line[FORM_START+formNum], formNum);
		}
		// 11-28: sentences
		for (let sentenceNum = 0; sentenceNum < NUM_OF_FORMS; sentenceNum++) {
			let sentTransIndex = SENT_START + 2*sentenceNum;
			let sentIndex = sentTransIndex + 1;
			if (line[sentIndex] == '' && line[sentTransIndex] == '') continue;
			let sent = (line[sentIndex] != '') ? line[sentIndex] : ('[[no '+primary_eng.abbr3+' version of sentence]]');
			let sentTrans = (line[sentTransIndex] != '') ? line[sentTransIndex] : ('[[no '+secondary_chk.abbr3+' version of sentence]]');
			e.addSentence(sent, sentTrans, sentenceNum);
		}
		// log data
		parse.push(e);

		if (line[0] == 'blackberry') {
			console.log('Test entry: "blackberry"');
			console.log(e);
		}

		if (line[0].split(';')[0] == 'family') {
			var e10 = EntryIIFE();
			window.e10 = e10;
			
			const line = entries[i].split(SEP_CELLS); // 26 in v9: 1 eng word, 1 catg, 8 chk words, 16 sentences
			// 0: eng forms
			e10.addPrimary(line[0]);
			// 1: part of speech
			e10.catg = line[1];
			// 2-10: chk forms
			for (let formNum = 0; formNum < NUM_OF_FORMS; formNum++) {
				if (line[FORM_START+formNum] == '') continue;
				e10.addSecondary(line[FORM_START+formNum], formNum);
			}
			// 11-28: sentences
			for (let sentenceNum = 0; sentenceNum < NUM_OF_FORMS; sentenceNum++) {
				let sentTransIndex = SENT_START + 2*sentenceNum;
				let sentIndex = sentTransIndex + 1;
				if (line[sentIndex] == '' && line[sentTransIndex] == '') continue;
				let sent = (line[sentIndex] != '') ? line[sentIndex] : ('[[no '+primary_eng.abbr3+' version of sentence]]');
				let sentTrans = (line[sentTransIndex] != '') ? line[sentTransIndex] : ('[[no '+secondary_chk.abbr3+' version of sentence]]');
				e10.addSentence(sent, sentTrans);
			}
			// auto-detect forms in sentences
			e10.labelSents();

			console.log('Test IIFE entry: "family"');
			console.log(e10);
		}
	}

	return parse;
}

function parse_en_ch_v10 (tsv) {
	// input: "eng1   catg   chk1-9   sent1-9   bonusSent1-2   notes\n"
	// output: {catg, notes, pForms[[synonyms],...], sForms[[synonyms],...], sents[{eng,chk},...], sentForms[formNum,...]}

	let parse = [];

	const NUM_OF_FORMS = 9;
	const FORM_START = 2;
	const SENT_START = 2 + NUM_OF_FORMS;
	const NOTES_START = SENT_START + 2*NUM_OF_FORMS + 2*2; // examples for 9 forms + 2 extra sentences

	const entries = tsv.split(SEP_LINES);
	for (let i = 1; i < entries.length; i++) {
		const line = entries[i].split(SEP_CELLS); // 34 in v10: 1 eng word, 1 catg, 9 chk words, 22 sentences, 1 note

		// if (['blackberry','family','African-American'].indexOf( line[0].split(';')[0] ) == -1) continue; // DEBUG check of [standard,capitalization,synonyms]

		let e = EntryIIFE();
		// 0: eng forms
		e.addPrimary(line[0]);
		// 1: part of speech
		e.catg = line[1];
		// 2-10: chk forms
		for (let formNum = 0; formNum < NUM_OF_FORMS; formNum++) {
			if (line[FORM_START+formNum] == '') continue;
			e.addSecondary(line[FORM_START+formNum], formNum);
		}
		// 11-32: sentences
		for (let sentenceNum = SENT_START; sentenceNum < NOTES_START; sentenceNum += 2) {
			const sentEngIndex = sentenceNum;
			const sentChkIndex = sentenceNum + 1;
			if (line[sentChkIndex] == '' && line[sentEngIndex] == '') continue;
			const sent = (line[sentChkIndex] != '') ? line[sentChkIndex] : ('[[no '+primary_eng.abbr3+' version of sentence]]');
			const sentTrans = (line[sentEngIndex]   != '') ? line[sentEngIndex]   : ('[[no '+secondary_chk.abbr3+' version of sentence]]');
			e.addSentence(sent, sentTrans);
		}
		// 33: entry notes
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

function parse_en_ch_v12 (tsv) {
	// input: "eng1   catg   chk1-9   sent1-9   bonusSent1-2   notes\n"
	// output: {catg, notes, pForms[[synonyms],...], sForms[[synonyms],...], sents[{eng,chk},...], sentForms[formNum,...]}

	let parse = [];

	const NUM_OF_FORMS = 9;
	const FORM_START = 5;
	const SENT_START = FORM_START + NUM_OF_FORMS;
	const NOTES_START = SENT_START + 2*NUM_OF_FORMS + 2*2; // examples for 9 forms + 2 extra sentences

	const entries = tsv.split(SEP_LINES);
	for (let i = 1; i < entries.length; i++) {
		const line = entries[i].split(SEP_CELLS); // 34 in v10: 1 eng word, 1 catg, 9 chk words, 22 sentences, 1 note

		// if (['blackberry','family','African-American'].indexOf( line[0].split(';')[0] ) == -1) continue; // DEBUG check of [standard,capitalization,synonyms]

		let e = EntryIIFE();
		// 0: eng forms
		e.addPrimary(line[0]);
		// 1: part of speech
		e.catg = line[1];
		// 2-4: root and morphemes
			// [skip]
		// 5-13: chk forms
		for (let formNum = 0; formNum < NUM_OF_FORMS; formNum++) {
			if (line[FORM_START+formNum] == '') continue;
			e.addSecondary(line[FORM_START+formNum], formNum);
		}
		// 14-35: sentences
		for (let sentenceNum = SENT_START; sentenceNum < NOTES_START; sentenceNum += 2) {
			const sentEngIndex = sentenceNum;
			const sentChkIndex = sentenceNum + 1;
			if (line[sentChkIndex] == '' && line[sentEngIndex] == '') continue;
			const sent = (line[sentChkIndex] != '') ? line[sentChkIndex] : ('[[no '+primary_eng.abbr3+' version of sentence]]');
			const sentTrans = (line[sentEngIndex]   != '') ? line[sentEngIndex]   : ('[[no '+secondary_chk.abbr3+' version of sentence]]');
			e.addSentence(sent, sentTrans);
		}
		// 36: entry notes
		e.notes= line[NOTES_START];
		// auto-detect forms in sentences
		e.labelSents();
		// log data
		parse.push(e);

		// if (line[0].split(';')[0] == 'blackberry') {
		// 	console.log('Test entry: "blackberry"');
		// 	console.log(e);
		// }
	}

	return parse;
}

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

		let e = EntryIIFE();
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



// let iifeParse = parse_en_ch_v10(tsv_en_ch_v10);

////////////////////////////

(function () {
	//// private global methods ////

	const SYNONYM_SPLITTER = '; ';

	// function arrayEqual (a,b) {
	// 	if (a.length !== b.length) return false;
	// 	for (let i = 0; i < a.length; i++) {
	// 		if (a[i] !== b[i]) {
	// 			return false;
	// 		}
	// 	}
	// 	return true;
	// }
	// function getFormNumSterilized (forms, word) { // excludes subscript numbering
	// 	word = word.toLowerCase();
	// 	for (let formNum = 0; formNum < forms.length; formNum++)
	// 		if (forms[formNum] && forms[formNum].some(x => x.toLowerCase().replace(/_.*/g,'') == word))
	// 			return formNum;
	// 	return -1;
	// }
	function debugLabelSents (sForms,sentences) {
		let labels = [];
		for (const sentence of sentences) {
			// discard non-alphanumeric characters and underscore annotation from each sentence
			let sentenceLabels = [];
			const words = sentence.secondary.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' '); // sterilize chars
			for (let formNum = 0; formNum < sForms.length; formNum++) {
				// if word doesn't have data for a form, skip it
				if (!sForms[formNum]) {
					// labels.push(undefined);
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
							sentenceLabels.push(formNum);
						}
					}
				}
				
			}
			labels.push(sentenceLabels);
		}
		return labels;

		// return sentences.map( sentence => {
		// 	console.log(sentence.secondary.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' '));
		// 	console.log(sentence.secondary.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' ').map( word => getFormNumSterilized(sForms, word) ));
		// 	return sentence.secondary
		// 		.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' ') // sterilize characters and split up sentence into words
		// 		.map( word => getFormNumSterilized(sForms, word) ).filter( formNum => formNum != -1 ) // indentify which form numbers are present
		// });
	}

	// function getSentenceForms (sForms, sentences) { //// NEED TO GENERALIZE THIS!!!
	// 	return sentences.map( sentence => {
	// 		return sentence.secondary
	// 			.toLowerCase().replace(/_.*/g,'').replace(/[^0-9a-z\'ʔ ]/g, '').split(' ') // sterilize characters and split up sentence into words; ignores subscript for now
	// 			.map( word => getFormNumSterilized(sForms, word) ).filter( formNum => formNum != -1 ) // indentify which form numbers are present; ignores subscript for now
	// 	});
	// }
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

	//// public access ////

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
			labelSents   : () => sentenceForms = debugLabelSents(sForms, sentences),
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
						callback(pForms[formNum], formNum);
			},
			forEachSecondaryForm : (callback = (synonyms,formNum)=>{}) => {
				for (let formNum = 0; formNum < sForms.length; formNum++)
					if (sForms[formNum])
						callback(sForms[formNum], formNum);
			},
			forEachSentence : (callback = (sentence,sentenceForm)=>{}) => {
				for (let sentNum = 0; sentNum < sentences.length; sentNum++)
					callback(sentences[sentNum],sentenceForms[sentNum]);
			}
		}
	}

	window.EntryIIFE = Entry;

})();

const SYNONYM_SPLITTER = '; ';

class Entry {
	constructor() {
		this._catg = undefined;
		this._pForms = [];
		this._sForms = [];
		this._sents = [];
		this._sentForms = [];
		this.notes = [];
	}

	addPrimaryForm(synonyms, formNum = -1) {
		if (formNum == -1) formNum = this._pForms.length; // if no forms, then order doesn't matter; use next open slot
		this._pForms[formNum] = synonyms.split(SYNONYM_SPLITTER);
	}
	addSecondaryForm(synonyms, formNum = -1) {
		if (formNum == -1) formNum = this._sForms.length; // if no forms, then order doesn't matter; use next open slot
		this._sForms[formNum] = synonyms.split(SYNONYM_SPLITTER);
	}
	addSentence(base, trans, formNum = -1) {
		this._sents.push( {base: base, trans: trans, form: formNum} );
	}

	labelSents () {
		// this._sentForms = [];
		// for (let sentence of this._sents) {
		// 	let forms = [];
			
		// 	const chkWordsSterilized = sentence.trans.toLowerCase().replace(/[^0-9a-z\'ʔ ]/g, '').split(' ');
		// 	for (let word of chkWordsSterilized) {
		// 		const formNum = this.searchSecondary(word);
		// 		if (formNum != -1) forms.push(formNum);
		// 	}

		// 	this._sentForms.push(forms);
		// }

		// console.log(this._sentForms);

		/////////////////

		function getFormNum (forms, word) {
			for (let formNum = 0; formNum < forms.length; formNum++){
				// console.log(word, formNum, forms[formNum], forms.some(x => x==word));
				if (forms[formNum] && forms[formNum].some(x => x==word)) {
					return formNum;
				}
			}
			return -1;
		}

		this._sentForms = this._sents.map( sentence =>
			sentence.trans
				.toLowerCase().replace(/[^0-9a-z\'ʔ ]/g, '').split(' ') // split up sentence into words
				.map( word => getFormNum(this._sForms, word) ).filter( formNum => formNum != -1 ) // indentify which form numbers are present
		);

		console.log(this._sentForms);
	}

	get catg() { return this._catg; }
	set catg(c) { this._catg = c; }

	// primarySynonymID(word) {
	// 	for (const form of this._pForms)
	// 		for (let i = 0; i < form.length; i++)
	// 			if (word == form[i]) return i;
	// 	return -1;
	// }

	getPrimaryForm(formNum) { return this._pForms[formNum]; }
	getSecondaryForm(formNum) { return this._sForms[formNum]; }
	getSentence(formNum) { return this._sents[formNum]; }

	// searchPrimary(word) {
	// 	for (let i = 0; i < this._pForms.length; i++) {
	// 		// console.log('   ',i,word,this._pForms[i]);
	// 		if (this._pForms[i] && this._pForms[i].indexOf(word) != -1) {
	// 			return i;
	// 		}
	// 	}
	// 	return -1;
	// }
	// searchSecondary(word) {
	// 	for (let i = 0; i < this._sForms.length; i++) {
	// 		// console.log('   ',i,word,this._sForms[i]);
	// 		if (this._sForms[i] && this._sForms[i].indexOf(word) != -1) {
	// 			return i;
	// 		}
	// 	}
	// 	return -1;
	// }

	forEachPrimaryForm(callback = (synonyms,formNum)=>{}) {
		for (let i = 0; i < this._pForms.length; i++)
			if (this._pForms[i])
				callback(this._pForms[i], i);
	}
	forEachSecondaryForm(callback = (synonyms,formNum)=>{}) {
		for (let i = 0; i < this._sForms.length; i++)
			if (this._sForms[i])
				callback(this._sForms[i], i);
	}
	forEachSentence(callback = (sentence)=>{}) {
		for (let sentence of this._sents)
			callback(sentence);
	}
}

const PRIMARY_LANG = false;
const SECONDARY_LANG = true;

class Dictionary {
	constructor(primaryLang, secondaryLang) {
		// raw data (loaded post-init)
		this._data = [];
		// L1 data
		this._pLang = primaryLang;
		this._pOrderedWords = [];
		this._pOrderedEntryWords = [];
		// L2 data
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


