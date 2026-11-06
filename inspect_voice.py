import re

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

pos = data.find(b'Lcom/huami/watch/newsport/ui/VoiceSportActivity;')
print('VoiceSportActivity class at', pos)

# Let's search all occurrences of VoiceSportActivity
all_pos = [m.start() for m in re.finditer(b'VoiceSportActivity', data)]
print('All VoiceSportActivity positions:', all_pos)

for p in all_pos:
    chunk = data[max(0, p-500):min(len(data), p+1500)]
    print(f'=== AT {p} ===')
    # Extract printable strings
    strings = re.findall(b'[\x20-\x7E]{4,}', chunk)
    for s in strings:
        print('  ', s.decode('latin1'))

