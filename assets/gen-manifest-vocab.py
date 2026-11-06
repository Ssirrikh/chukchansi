import json
import os
import re
import subprocess
import time

# scan /assets/vocab for vocab.json vocab lists and compile into manifest
# other programs load vocab lists from manifest

RE_JSON = re.compile(r'.+\.json$')

DIR_VOCAB = f'{os.getcwd()}\\vocab' # changes depending where this script is run from
DEFAULT_FILE_VOCAB = 'vocab.json'
FILE_MANIFEST = 'manifests/manifest-vocab.json'

manifest = []

def filepath2url (path='',preserveLeadingSlash=False):
    # reformat relative filepath as relative web url; removes leading slash by default
    path = path.replace('\\', '/')
    if not preserveLeadingSlash and path[0] == '/':
        path = path[1:]
    return path

for (root,dirs,files) in os.walk(DIR_VOCAB,topdown=True):
    # print(f'ROOT {root}')
    # print(f'DIRS {dirs}')
    # print(f'FILES {files}')
    for file in files:
        if not re.search(RE_JSON, file): continue # only scan JSON files
        fullpath = f'{root}\\{file}'
        with open(fullpath, 'r') as f:
            file_vocab = json.load(f)
            if 'words' not in file_vocab or type(file_vocab['words']) is not list:
                continue # check that json is actually a vocab list
            title = str(file_vocab['title'] or '')
            count = int(len(file_vocab['words']) or 0)
            path = fullpath.replace(DIR_VOCAB,'')
            manifest.append({ "title":title, "count":count, "path":filepath2url(path) })

# print to terminal
print('FINAL MANIFEST OF VOCAB')
for file in manifest:
    print(f'    {file}')
if len(manifest) == 0:
    print(f'    [no JSON vocab files found]')
# generate manifest file
with open(FILE_MANIFEST,'w',encoding='utf-8') as f:
    f.write( json.dumps(manifest) )