import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

from find_key_listener import get_method_name, get_type

# Find method ID of startSportIntent
method_ids_size, method_ids_off = struct.unpack_from('<II', dex, 88)
target_method_ids = []
for i in range(method_ids_size):
    m_name = get_method_name(i)
    if 'startSportIntent' in m_name:
        print(f'Method {i}: {m_name}')
        target_method_ids.append(i)

# Search bytecode for invoke of this method
import re
for mid in target_method_ids:
    target_bytes = struct.pack('<H', mid)
    for m in re.finditer(b'[\x6e-\x72].' + re.escape(target_bytes), dex):
        pos = m.start()
        print(f'Invoke at {pos}:')

