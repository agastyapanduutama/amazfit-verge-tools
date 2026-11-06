import re

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

# Search for SPORT_GPS_SEARCH
pos = data.find(b'SPORT_GPS_SEARCH')
print('SPORT_GPS_SEARCH at', pos)
if pos != -1:
    chunk = data[max(0, pos-200):min(len(data), pos+1000)]
    strings = re.findall(b'[\x20-\x7E]{3,}', chunk)
    for s in strings:
        print('  ', s.decode('latin1'))

# Search for com.huami.watch.sport.action
pos = 0
while True:
    pos = data.find(b'com.huami.watch.sport.action', pos)
    if pos == -1: break
    print(f'action at {pos}:', data[pos:pos+60])
    pos += 10

