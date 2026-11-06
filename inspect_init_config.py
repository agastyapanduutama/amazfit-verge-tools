import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

# Let's inspect the exact bytecode at 3258508 (around offset 80 which is 3258508 + 20)
# We have find_dex_str and type_ids
type_ids_size, type_ids_off = struct.unpack_from('<II', dex, 64)
string_ids_size, string_ids_off = struct.unpack_from('<II', dex, 56)

def get_str(str_id):
    if str_id >= string_ids_size: return f'str_{str_id}'
    off = struct.unpack_from('<I', dex, string_ids_off + str_id * 4)[0]
    pos = off
    l = 0
    shift = 0
    while True:
        b = dex[pos]
        pos += 1
        l |= (b & 0x7f) << shift
        if not (b & 0x80): break
        shift += 7
    return dex[pos:pos+l].decode('utf-8', errors='ignore')

def get_type(type_id):
    if type_id >= type_ids_size: return f'type_{type_id}'
    descriptor_idx = struct.unpack_from('<I', dex, type_ids_off + type_id * 4)[0]
    return get_str(descriptor_idx)

# Search for SportInitConfig class
for i in range(type_ids_size):
    t = get_type(i)
    if 'SportInitConfig' in t:
        print(f'Type {i}: {t}')

pos = 3258508
print('Bytes around pos:')
for b in dex[pos:pos+100]:
    print(f'{b:02x}', end=' ')
print()

