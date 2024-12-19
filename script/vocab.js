
// if (!window['CHK_STORIES']) {
//     window['CHK_STORIES'] = {
//         stories
//     };
// }

if (!window['CHK_VOCAB']) {
    window['CHK_VOCAB'] = {
        // data
        namesCHK : [], setsCHK : [], // curated or gen'd sets of chk words
        namesENG : [], setsENG : [], // sets of eng words, which will be used to compile lists of chk words at runtime
        // chukchansi vocab
        getCHK : (name) => {
            for (let i = 0; i < CHK_VOCAB.namesCHK.length; i++) {
                if (CHK_VOCAB.namesCHK[i] == name) {
                    return CHK_VOCAB.setsCHK[i];
                }
            }
        },
        getRandListCHK : (name,n) => {
            for (let i = 0; i < CHK_VOCAB.namesCHK.length; i++) {
                if (CHK_VOCAB.namesCHK[i] == name) {
                    // Schwartzian transform in functional programming paradigm from https://stackoverflow.com/a/46545530
                    return CHK_VOCAB.setsCHK[i].slice(0) // copy
                        .map(value => ({ value, sort: Math.random() })) // decorate
                        .sort((a,b) => a.sort - b.sort) // sort
                        .map(({ value }) => value) // undecorate
                        .slice(0,n); // choose n
                }
            }
        },
        addCHK : (name,list) => {
            // if list already exists, overwrite it
            for (let i = 0; i < CHK_VOCAB.namesCHK.length; i++) {
                if (CHK_VOCAB.namesCHK[i] == name) {
                    console.log(`Overwrote list "${name}".`);
                    CHK_VOCAB.setsCHK[i] = list;
                    return true;
                }
            }
            // else, add it normally
            CHK_VOCAB.namesCHK.push(name);
            CHK_VOCAB.setsCHK.push(list);
            return false;
        },
        forEachCHK : (callback=(name,list,i)=>{}) => {
            for (let i = 0; i < CHK_VOCAB.namesCHK.length; i++) {
                callback(CHK_VOCAB.namesCHK[i], CHK_VOCAB.setsCHK[i], i);
            }
        }
        // english vocab
    };
}

///////////////////

(!window['CHK_VOCAB']) ? console.error(`ERR Must load base vocab module before adding vocab lists.`) : CHK_VOCAB.addCHK(
    'Sox-Siksikaʔ',
    ["Sox","Siksikaʔ","ʔoshto","woodiyga","namix","ʔutuytaʔ","henew","t'uluntaʔ","shaapintaʔ","limeek'am"]
);

(!window['CHK_VOCAB']) ? console.error(`ERR Must load base vocab module before adding vocab lists.`) : CHK_VOCAB.addCHK(
    'Colors',
    ["Red","Yellow","Blue"]
);

CHK_VOCAB.forEachCHK((name,list,i) => {
    console.log(i,name,list);
});
for (let i = 0; i < 4; i++) {
    console.log( CHK_VOCAB.getRandListCHK('Sox-Siksikaʔ',5).sort((a,b)=>a.localeCompare(b)) ); // localeCompare() is case-insensative by default
}