
// import * as parser from './parse-toolbox-output.js';

///////////////////////////////////////

//// program state

let loading = true;
let vocabManifest = []; // collection of valid vocab lists
let activeVocab = -1; // 
let activeVocabData = {}; // loaded vocab list JSON

const setActive = (i) => {
    i = parseInt(i);
    if (isNaN(i)) {
        console.warn(`Invalid vocab list id "${i}"`);
        return;
    }
    activeVocab = Math.min(Math.max(1, i), vocabManifest.length); // vocab set id is 1-indexed, not 0-indexed
    setParamsFrom(activeVocab);
};
const forEachSet = (callback = (vocabSet,i)=>{}) => {
    let vocabSets = vocabManifest ?? [];
    for (let i = 0; i < vocabSets.length; i++) {
        callback(vocabSets[i], i);
    }
};
const forEachFlashcard = (callback = (flashcard,i)=>{}) => {
    let vocab = activeVocabData?.words ?? [];
    for (let i = 0; i < vocab.length; i++) {
        callback(vocab[i], i);
    }
};



//// param handlers

const tryGetFromParams = () => {
    // get url params
    if (!window.location.search) {
        console.log(`No url params detected.`);
        return false;
    }
    const params = new URLSearchParams(window.location.search);
    console.log('Params:', params.toString());
    // load entry
    setActive(params.get('set')); // setActive() performs error checking/correction
    return true;
};
const setParamsFrom = (vocabSet) => {
    // sterilize input
    vocabSet = parseInt(vocabSet);
    if (isNaN(vocabSet)) {
        console.warn(`"${vocabSet}" is an invalid vocab set id.`);
        return false;
    }
    vocabSet = Math.min(Math.max(0, vocabSet), vocabManifest.length-1);
    // preserve existing params to ensure only target param(s) modified
    const params = new URLSearchParams(window.location.search);
    params.set('set', vocabSet);
    // construct url param string
    history.pushState({}, '', `?${params.toString()}`);
    return true;
};
const activateInitialVocabSet = () => {
    // focus initial vocab set from params, else default to first set in manifest
    if (!tryGetFromParams()) {
        setActive(1);
    }
};



// content loaders
const loadManifest = async (onLoad = ()=>{}) => {
    loading = true;
    try {
        // load vocab manifest
        const url = `./assets/manifests/manifest-vocab.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Vocab manifest failed to load with response: ${res.status}`);
        vocabManifest = Object.freeze(await res.json());
        console.log('Vocab manifest:', vocabManifest);
        loading = false;
        activateInitialVocabSet();
        onLoad();
        return true;
    } catch (err) {
        loading = false;
        console.error(err.message);
        return false;
    }
};
const loadVocab = async (i, onLoad=(vocabData)=>{}) => {
    if (vocabManifest.length < 1) {
        console.warn(`Vocab manifest not loaded. Unable to find any vocab set to load.`);
        return false;
    }
    i = parseInt(i);
    if (isNaN(i)) {
        console.warn(`Invalid vocab set id "${i}"`);
        return false;
    }
    i = Math.min(Math.max(1, i), vocabManifest.length); // vocab set id is 1-indexed, not 0-indexed
    if (activeVocab !== i) setActive(i);
    loading = true;
    try {
        const url = `./assets/vocab/${vocabManifest[i-1].path}`; // 1-indexed vocab set id -> 0-indexed manifest entry
        console.log(`Loading vocab set ${i} at ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Vocab set ${i} failed to load with response: ${res.status}`);
        activeVocabData = Object.freeze(await res.json());
        console.log('Vocab set data:', activeVocabData);
        loading = false;
        onLoad(activeVocabData);
        return true;
    } catch (err) {
        loading = false;
        console.error(err.message);
        return false;
    }
};



///////////////////////////////////////

export default {
    get loading () { return loading },
    // manifest of vocab lists
    get manifest () { return vocabManifest ?? [] },
    loadManifest,
    forEachSet,
    // active vocab list
    get activeSet () { return activeVocab },
    set activeSet (i) { setActive(i) },
    get activeSetData () { return activeVocabData },
    loadVocab,
    forEachFlashcard
}

// NOTE: indexing
    // forEachSet() and forEachFlashcard() are 0-indexed
    // but activeSet and loadVocab() are 1-indexed

// DATA SAFETY:
    // suppose loadManifest() is intercepted:
        // injected relative paths can access other files in server; non-issue, since no sensative files are kept in project
    // suppose loadVocab() is intercepted:
        // avoid Object.assign(element, json)
        // TODO: set character limit on `element.textContent = ...` to avoid DOM overload by large strings
        // do not load multiple json from manifeset to avoid memory overload by large json files
        // TODO: validate json file size, and/or display notification if response takes too long