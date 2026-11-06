import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

from find_key_listener import get_method_name, get_str, get_type

# Find SportActivity type_id
type_ids_size, type_ids_off = struct.unpack_from('<II', dex, 64)
sport_activity_type_id = None
for i in range(type_ids_size):
    if get_type(i) == 'Lcom/huami/watch/newsport/ui/SportActivity;':
        sport_activity_type_id = i
        break

print('SportActivity type_id:', sport_activity_type_id)

# Find class_def for SportActivity
class_defs_size, class_defs_off = struct.unpack_from('<II', dex, 96)
class_data_off = None
for i in range(class_defs_size):
    class_idx, access_flags, superclass_idx, interfaces_off, source_file_idx, annotations_off, cdata_off, static_values_off = struct.unpack_from('<IIIIIIII', dex, class_defs_off + i * 32)
    if class_idx == sport_activity_type_id:
        class_data_off = cdata_off
        print(f'Found SportActivity class_def at {i}, class_data_off: {class_data_off}')
        break

from decode_gps_methods import read_uleb128
pos = class_data_off
static_fields_size, pos = read_uleb128(pos)
instance_fields_size, pos = read_uleb128(pos)
direct_methods_size, pos = read_uleb128(pos)
virtual_methods_size, pos = read_uleb128(pos)

for i in range(static_fields_size):
    f_idx, pos = read_uleb128(pos); f_access, pos = read_uleb128(pos)
for i in range(instance_fields_size):
    f_idx, pos = read_uleb128(pos); f_access, pos = read_uleb128(pos)

m_idx = 0
for i in range(direct_methods_size):
    diff, pos = read_uleb128(pos); m_idx += diff; access, pos = read_uleb128(pos); code_off, pos = read_uleb128(pos)

m_idx = 0
for i in range(virtual_methods_size):
    diff, pos = read_uleb128(pos); m_idx += diff; access, pos = read_uleb128(pos); code_off, pos = read_uleb128(pos)
    name = get_method_name(m_idx)
    if 'onCreate' in name:
        print(f'SportActivity->onCreate at code_off: {code_off}')
        # Disassemble
        code_item = dex[code_off:code_off+200]
        # scan for const-string
        insns = dex[code_off+16:code_off+16+100]
        for j in range(0, len(insns)-4, 2):
            if insns[j] == 0x1a:
                sid = struct.unpack_from('<H', insns, j+2)[0]
                print(f'  const-string "{get_str(sid)}"')

