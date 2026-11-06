import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

# Let's find GPSActivity class_def
# GPSActivity type_id
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

gps_activity_type_id = None
for i in range(type_ids_size):
    if get_type(i) == 'Lcom/huami/watch/newsport/ui/GPSActivity;':
        gps_activity_type_id = i
        break

print('GPSActivity type_id:', gps_activity_type_id)

# Find class_def for GPSActivity
class_defs_size, class_defs_off = struct.unpack_from('<II', dex, 96)
print('class_defs_size:', class_defs_size)

for i in range(class_defs_size):
    class_idx, access_flags, superclass_idx, interfaces_off, source_file_idx, annotations_off, class_data_off, static_values_off = struct.unpack_from('<IIIIIIII', dex, class_defs_off + i * 32)
    if class_idx == gps_activity_type_id:
        print(f'Found GPSActivity class_def at {i}, class_data_off: {class_data_off}')
        break

