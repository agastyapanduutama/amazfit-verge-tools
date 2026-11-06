with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

import re

for target in [b'SportInitConfig$Builder', b'SportInitConfig']:
    pos = 0
    while True:
        pos = data.find(target, pos)
        if pos == -1: break
        chunk = data[max(0, pos-100):min(len(data), pos+400)]
        strings = re.findall(b'[\x20-\x7E]{3,}', chunk)
        print(f'{target} at {pos}:')
        for s in strings:
            print('  ', s.decode('latin1'))
        pos += len(target)

