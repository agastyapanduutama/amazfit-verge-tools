with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

import re

for target in [b'com.huami.watch.sport.LAUNCHER_SPORT', b'com.huami.watch.sport.type']:
    pos = 0
    while True:
        pos = data.find(target, pos)
        if pos == -1: break
        print(f'{target} at {pos}:')
        chunk = data[max(0, pos-200):min(len(data), pos+400)]
        strings = re.findall(b'[\x20-\x7E]{3,}', chunk)
        for s in strings:
            print('  ', s.decode('latin1'))
        pos += len(target)

