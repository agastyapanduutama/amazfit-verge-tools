with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

import re

# Find methods of SportInitConfig$Builder
pos = data.find(b'SportInitConfig$Builder;')
print('Class at', pos)

# Find all occurrences of "sportType" or "build" or constructor
for m in re.finditer(b'(setSportType|sportType|build|setSport|SportInitConfig)', data):
    p = m.start()
    if 4000000 < p < 5100000:
        chunk = data[max(0, p-40):min(len(data), p+60)]
        strings = re.findall(b'[\x20-\x7E]{3,}', chunk)
        print(f'Match at {p}: {strings}')

