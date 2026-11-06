import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

from find_key_listener import get_method_name, get_str

code_off = 2829388
registers_size, ins_size, outs_size, tries_size, debug_info_off, insns_size = struct.unpack_from('<HHHHII', dex, code_off)
print(f'onKeyClick: registers: {registers_size}, insns_size: {insns_size}')

insns = dex[code_off+16:code_off+16+insns_size*2]

i = 0
while i < len(insns):
    op = insns[i]
    if op in (0x6e, 0x6f, 0x70, 0x71, 0x72):
        meth_id = struct.unpack_from('<H', insns, i+2)[0]
        print(f'{i:04x}: invoke {get_method_name(meth_id)}')
        i += 6
    else:
        i += 2

