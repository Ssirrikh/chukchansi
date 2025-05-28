
#### wave 3 ####

# 1.5 hrs: dev word-of-the-day compiler to auto-gen js file
# 1.5 hrs: set up auto-generation of js file and prep for future build automation



import codecs
from datetime import datetime
import random
import sys

if len(sys.argv) < 2:
	print('Error: invalid usage, use "python wotd.py [input.tsv]"')
	exit(1)

args = sys.argv[1:]
F_INPUT = args[0]
F_OUTPUT = 'wotd.js'
VERSION = 13 # assume v13 data; will be arg passed in by automation script eventually

# read text
lines = None
with open(F_INPUT, encoding='utf-8') as f:
	lines = f.read().split('\n')

# data v13
NUM_OF_FORMS = 10;
NUM_EXTRA_SENTS = 2;
FORM_START = 6;
SENT_START = FORM_START + NUM_OF_FORMS;
NOTES_START = SENT_START + 2*NUM_OF_FORMS + 2*NUM_EXTRA_SENTS;

VALID_CATGS_2FORM = ['noun','pronoun','adjective','verb']
VALID_CATGS_1FORM = ['adverb']

indicesValid = []
indicesInvalid = []
numEntries = 0
numValidEntries = 0
numValidCatg = 0
numValidForm = 0
numValidSentence = 0
for line in lines:
	cells = line.split('\t')

	# label data
	eng = cells[0]
	catg = cells[1]
	chk = cells[FORM_START:SENT_START]
	sentences = cells[SENT_START:NOTES_START]
	# check validity
	has1Form = catg in VALID_CATGS_1FORM
	has2Forms = catg in VALID_CATGS_2FORM
	isValidCatg = has1Form or has2Forms
	hasEnoughForms = (has1Form and chk[0] != '' and chk[0] != '---') or (has2Forms and chk[0] != '' and chk[0] != '---' and chk[1] != '' and chk[1] != '---')
	hasExampleSentence = False
	firstExampleSentence = -1
	firstExampleTranslation = -1
	for i in range(SENT_START,NOTES_START):
		if cells[i] != '' and cells[i] != '---':
			hasExampleSentence = True
			firstExampleSentence = i
			firstExampleTranslation = i + 1
			break
	isValid = isValidCatg and hasEnoughForms and hasExampleSentence

	# console output
	if isValid:
		chkStr = chk[0] if has1Form else f'{chk[0]},{chk[1]}'
		print(f'{eng} ({catg}) {chkStr} - "{cells[firstExampleSentence]}"')
	else:
		errCatg = "" if isValidCatg else "ERR_CATG"
		errForm = "" if hasEnoughForms else "ERR_FORM"
		errSent = "" if hasExampleSentence else "ERR_SENTENCE"
		chkStr = chk[0] if has1Form else f'{chk[0]},{chk[1]}'
		print(f'INVALID {",".join(s for s in [errCatg,errForm,errSent] if s)} :: {eng} ({catg}) {chkStr} - "{cells[firstExampleSentence]}"')

	if isValid:
		indicesValid.append(numEntries)
	else:
		indicesInvalid.append(numEntries)

	numEntries += 1
	if isValidCatg:
		numValidCatg += 1
	if hasEnoughForms:
		numValidForm += 1
	if hasExampleSentence:
		numValidSentence += 1
	if isValid:
		numValidEntries += 1

print('valid',indicesValid)
print('invalid',indicesInvalid)

print(f'{numEntries-numValidCatg} / {numEntries} entries excluded by catg')
print(f'{numEntries-numValidForm} / {numEntries} entries excluded for not having enough forms')
print(f'{numEntries-numValidSentence} / {numEntries} entries excluded for not having any example sentences')
print(f'{numValidEntries} / {numEntries} entries are valid for word-of-the-day')

# output
with open(F_OUTPUT,'w') as f:
	wotdList = [str(i) for i in indicesValid]
	random.shuffle(wotdList)
	f.write(f"//// Chukchansi Word of the Day ////\n\n")
	f.write(f"// list auto-generated for v{VERSION} data on {datetime.today().strftime('%b %d, %Y')}\n")
	f.write(f"// {numValidEntries} / {numEntries} entries pass criteria (part-of-speech not unusual, has enough forms, has example sentence)\n")
	f.write("// entries shuffled non-deterministically\n\n")
	f.write("(() => {\n")

	f.write(f"\tconst wotdIndices = [{','.join( wotdList )}];\n\n")

	f.write("\tconst d0 = new Date(1964,8,2); // wrapping uses Aug 2, 1964 as anchor (we miss you lots <3)\n")
	f.write("\tconst d1 = new Date();\n")
	f.write("\tconst utc0 = Date.UTC(d0.getFullYear(), d0.getMonth(), d0.getDate());\n")
	f.write("\tconst utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());\n")
	f.write("\tconst daysElapsed = Math.floor((utc1 - utc0) / (1000 * 60 * 60 * 24)); // divide ms elapsed by ms-per-day\n")
	f.write("\tconst entryIndex = wotdIndices[daysElapsed % wotdIndices.length]; // entry index of wotd\n\n")

	f.write("\twindow['wotd'] = Object.freeze({\n")
	f.write("\t\td0 : d0,\n")
	f.write("\t\td1 : d1,\n")
	f.write("\t\tentryIndex : entryIndex\n")
	f.write("\t});\n\n")

	f.write("\tconsole.log(`Word-of-the-day module loaded. Today's wotd is entry ${entryIndex}.\\nAccess with \"dictionary._data[wotd.entryIndex]\".`);\n\n")

	f.write("})();\n")
	# should we cat in a unified copyright statement to all scripts at some point?

print(f'Output saved to "{F_OUTPUT}"')