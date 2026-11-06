import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

code_off = 2826216
insns = dex[code_off+16:code_off+16+118*2]
# print raw bytes from 0x0050 to 0x0070
for b in insns[0x50:0x70]:
    print(f'{b:02x}', end=' ')
print()

