import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

from find_key_listener import get_method_name, get_str, get_type

# Find SportInitConfig and SportInitConfig$Builder methods
type_ids_size, type_ids_off = struct.unpack_from('<II', dex, 64)
method_ids_size, method_ids_off = struct.unpack_from('<II', dex, 88)

for i in range(method_ids_size):
    m_name = get_method_name(i)
    if 'SportInitConfig' in m_name:
        print(f'Method {i}: {m_name}')

