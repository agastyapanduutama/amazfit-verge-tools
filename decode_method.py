import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

string_ids_size, string_ids_off = struct.unpack_from('<II', dex, 56)

def get_str(str_id):
    if str_id >= string_ids_size: return f'str_{str_id}'
    off = struct.unpack_from('<I', dex, string_ids_off + str_id * 4)[0]
    # skip uleb128
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

# At 3258508
# Let's inspect the const-string instructions in this chunk:
chunk = dex[3258508-60:3258508+140]

# Search for any const-string (0x1a)
for i in range(len(chunk)-3):
    if chunk[i] == 0x1a:
        v = chunk[i+1]
        str_id = chunk[i+2] | (chunk[i+3] << 8)
        s = get_str(str_id)
        print(f'Offset {i}: const-string v{v}, "{s}" (id {str_id})')

