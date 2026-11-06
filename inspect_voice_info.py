import re

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

pos = 0
while True:
    pos = data.find(b'VoiceInfo', pos)
    if pos == -1: break
    print(f'VoiceInfo at {pos}:')
    chunk = data[max(0, pos-200):min(len(data), pos+500)]
    strings = re.findall(b'[\x20-\x7E]{3,}', chunk)
    for s in strings:
        print('  ', s.decode('latin1'))
    pos += len('VoiceInfo')

