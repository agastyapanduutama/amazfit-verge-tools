import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

# Find method_id for startSportIntent
# Direct method 18 in GPSActivity
# Let's search for calls to startSportIntent
# The method name is "startSportIntent"
pos = 0
while True:
    pos = dex.find(b'startSportIntent', pos)
    if pos == -1: break
    print(f'startSportIntent at {pos}')
    pos += len('startSportIntent')

