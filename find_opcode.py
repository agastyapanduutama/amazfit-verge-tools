import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

target_opcode1 = b'\x1a' # const-string
# search for \x1a [any byte] \xc8\x4f
import re

for m in re.finditer(b'\x1a.[\xc8][\x4f]', dex):
    pos = m.start()
    print(f'const-string at {pos} (abs {dex_offset + pos}):')
    # print surrounding 100 bytes of instructions
    chunk = dex[max(0, pos-40):min(len(dex), pos+160)]
    print(' '.join(f'{b:02x}' for b in chunk))

