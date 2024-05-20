
# 0.5 hrs: build special resource list for Jasmine's demo

import os

WORKING_DIRECTORY = os.getcwd() + '\\images-batch-3'
EXT_IMAGE = ['jpg', 'png']
OUTPUT_TEXT = 'resources-jasmine.txt'
OUTPUT_CODE = 'resources-jasmine.js'

files = []
nonmatches = []

images = []
misc = []

print('Scanning files in ' + WORKING_DIRECTORY)

for (dirpath, dirnames, filenames) in os.walk(WORKING_DIRECTORY):
    DIRECTORY_PATH = dirpath.replace(WORKING_DIRECTORY,'')
    for filename in filenames:
        FILE_PATH = ('\\images-batch-3' + DIRECTORY_PATH + '\\' + filename).replace('\\','/')[1:] # [1:] to remove initial '/'
        FILE_EXT = FILE_PATH.split('.')[-1]
        files.append(FILE_PATH)
        if FILE_EXT in EXT_IMAGE:
            print('IMG ... ' + FILE_PATH)
            images.append(FILE_PATH)
        else:
            print(FILE_EXT + ' !!! ' + FILE_PATH)
            nonmatches.append(FILE_EXT + ' !!! ' + FILE_PATH)
            misc.append(FILE_PATH)

print('Scanned ' + str(len(files)) + ' files (' + str(len(images)) + ' images, ' + str(len(misc)) + ' misc)')
print('\nList of misc files:')
for filepath in nonmatches:
    print(filepath)

with open(OUTPUT_TEXT, 'w', encoding='utf-8') as f:
    for file in files:
        f.write(file + '\n')

with open(OUTPUT_CODE, 'w', encoding='utf-8') as f:
    f.write('let image_jasmine = [\n\t"')
    f.write('",\n\t"'.join(images))
    f.write('"\n];')
