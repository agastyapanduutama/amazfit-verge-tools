import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

string_ids_size, string_ids_off = struct.unpack_from('<II', dex, 56)
type_ids_size, type_ids_off = struct.unpack_from('<II', dex, 64)
method_ids_size, method_ids_off = struct.unpack_from('<II', dex, 88)

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

def get_method_name(method_id):
    class_idx, proto_idx, name_idx = struct.unpack_from('<HHI', dex, method_ids_off + method_id * 8)
    return get_type(class_idx) + '->' + get_str(name_idx)

def read_uleb128(pos):
    val = 0
    shift = 0
    while True:
        b = dex[pos]
        pos += 1
        val |= (b & 0x7f) << shift
        if not (b & 0x80): break
        shift += 7
    return val, pos

pos = 5909972
static_fields_size, pos = read_uleb128(pos)
instance_fields_size, pos = read_uleb128(pos)
direct_methods_size, pos = read_uleb128(pos)
virtual_methods_size, pos = read_uleb128(pos)

print(f'direct_methods: {direct_methods_size}, virtual_methods: {virtual_methods_size}')

# skip fields
for i in range(static_fields_size):
    f_idx, pos = read_uleb128(pos)
    f_access, pos = read_uleb128(pos)

for i in range(instance_fields_size):
    f_idx, pos = read_uleb128(pos)
    f_access, pos = read_uleb128(pos)

# read direct methods
m_idx = 0
for i in range(direct_methods_size):
    diff, pos = read_uleb128(pos)
    m_idx += diff
    access, pos = read_uleb128(pos)
    code_off, pos = read_uleb128(pos)
    print(f'Direct method {i}: {get_method_name(m_idx)} (code_off: {code_off})')

# read virtual methods
m_idx = 0
for i in range(virtual_methods_size):
    diff, pos = read_uleb128(pos)
    m_idx += diff
    access, pos = read_uleb128(pos)
    code_off, pos = read_uleb128(pos)
    m_name = get_method_name(m_idx)
    if 'onCreate' in m_name or 'init' in m_name or 'Intent' in m_name or 'onStart' in m_name:
        print(f'Virtual method {i}: {m_name} (code_off: {code_off})')

