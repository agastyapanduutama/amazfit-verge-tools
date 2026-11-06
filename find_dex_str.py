import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

# An odex file has a dex file inside it. Let's find 'dex\n035\0'
dex_offset = data.find(b'dex\n035\x00')
print('DEX offset:', dex_offset)
if dex_offset == -1:
    dex_offset = data.find(b'dex\n')
    print('DEX offset alternate:', dex_offset)

dex = data[dex_offset:]
magic, checksum, signature, file_size, header_size, endian_tag, link_size, link_off, map_off, string_ids_size, string_ids_off = struct.unpack_from('<8sI20sIIIIIIII', dex, 0)
print(f'string_ids_size: {string_ids_size}, string_ids_off: {string_ids_off}')

# Let's find the string index of "com.huami.watch.sport.action.SPORT_GPS_SEARCH"
target_str = b'com.huami.watch.sport.action.SPORT_GPS_SEARCH'

for i in range(string_ids_size):
    str_off = struct.unpack_from('<I', dex, string_ids_off + i * 4)[0]
    # read string
    # uleb128 length
    # then bytes
    s = dex[str_off+1:str_off+1+len(target_str)]
    if s == target_str:
        print(f'Found target string at string_id: {i} (hex: {hex(i)})')
        break

