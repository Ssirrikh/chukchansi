
# 2.5 hrs: automate building of formatted list of resource files; >2 hrs of struggling with windows cmd with no results, then <15 min to success in python; I hate DOS
# 1.0 hrs: fix encoding issue with glottal stop character, automate building of usable .js file

import os

WORKING_DIRECTORY = os.getcwd()
EXT_IMAGE = ['jpg', 'png']
EXT_AUDIO = ['mp3', 'wav']
OUTPUT_TEXT = 'resources.txt'
OUTPUT_CODE = 'resources.js'

files = []
nonmatches = []

images = []
audio = []
misc = []

print('Scanning files in ' + WORKING_DIRECTORY)

for (dirpath, dirnames, filenames) in os.walk(WORKING_DIRECTORY):
    DIRECTORY_PATH = dirpath.replace(WORKING_DIRECTORY,'')
    for filename in filenames:
        FILE_PATH = (DIRECTORY_PATH + '\\' + filename).replace('\\','/')[1:] # [1:] to remove initial '/'
        FILE_EXT = FILE_PATH.split('.')[-1]
        files.append(FILE_PATH)
        if FILE_EXT in EXT_IMAGE:
            print('IMG ... ' + FILE_PATH)
            images.append(FILE_PATH)
        elif FILE_EXT in EXT_AUDIO:
            print('AUD ... ' + FILE_PATH)
            audio.append(FILE_PATH)
        else:
            print(FILE_EXT + ' !!! ' + FILE_PATH)
            nonmatches.append(FILE_EXT + ' !!! ' + FILE_PATH)
            misc.append(FILE_PATH)

print('Scanned ' + str(len(files)) + ' files (' + str(len(images)) + ' images, ' + str(len(audio)) + ' audio, ' + str(len(misc)) + ' misc)')
print('\nList of misc files:')
for filepath in nonmatches:
    print(filepath)

with open(OUTPUT_TEXT, 'w', encoding='utf-8') as f:
    for file in files:
        f.write(file + '\n')

with open(OUTPUT_CODE, 'w', encoding='utf-8') as f:
    f.write('let image_en_ch = [\n\t"')
    f.write('",\n\t"'.join(images))
    f.write('"\n];')
    f.write('\n\n');
    f.write('let audio_en_ch = [\n\t"')
    f.write('",\n\t"'.join(audio))
    f.write('"\n];')
