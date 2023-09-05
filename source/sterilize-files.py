
# 1.0 hrs: something (excel? chrome?) repeatedly converts ' to _ in filenames; built script to undo this change
# 0.5 hrs: automatically convert file extensions to lowercase

import os
import re

WORKING_DIRECTORY = os.getcwd()

sterilized_file = False
sub_name = re.compile(r"_(?=[^HJ][^\.].*)", flags=re.NOFLAG).sub # _ that don't come before a speaker id need to be turned back into '
# low_ext = re.compile(r"(?=.*)(\.[a-zA-Z]+)", flags=re.NOFLAG).sub # force file extensions to lowercase

print('Sterilizing filenames in ' + WORKING_DIRECTORY)

for (dirpath, dirnames, filenames) in os.walk(WORKING_DIRECTORY):
    for filename in filenames:
        FILE_PATH_OLD = (dirpath + '\\' + filename)
        # force file extensions to lowercase
        FILE_PATH_NEW = re.sub(r"(?=.*)(\.[a-zA-Z]+)", lambda pattern: pattern.group(1).lower(), FILE_PATH_OLD)
        # _ that don't come before a speaker id need to be turned back into '
        FILE_PATH_NEW = sub_name("'", FILE_PATH_NEW)

        if FILE_PATH_OLD != FILE_PATH_NEW:
            print('sterilize ' + FILE_PATH_OLD)
            print('       -> ' + FILE_PATH_NEW)
            sterilized_file = True
            try:
                os.rename(FILE_PATH_OLD, FILE_PATH_NEW)
            except OSError as exc:
                print(exc)

if not sterilized_file:
    print('[no new files to sterilize]')
