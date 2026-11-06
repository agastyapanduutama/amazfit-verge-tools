import struct

with open('c:/bingkai/AmazfitTrigger/NewWearSport.odex', 'rb') as f:
    data = f.read()

dex_offset = data.find(b'dex\n035\x00')
dex = data[dex_offset:]

string_ids_size, string_ids_off = struct.unpack_from('<II', dex, 56)
type_ids_size, type_ids_off = struct.unpack_from('<II', dex, 64)
method_ids_size, method_ids_off = struct.unpack_from('<II', dex, 88)
field_ids_size, field_ids_off = struct.unpack_from('<II', dex, 80)

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

code_off = 2826216
registers_size, ins_size, outs_size, tries_size, debug_info_off, insns_size = struct.unpack_from('<HHHHII', dex, code_off)
print(f'startSportIntent: registers: {registers_size}, insns_size: {insns_size}')

insns = dex[code_off+16:code_off+16+insns_size*2]

i = 0
while i < len(insns):
    op = insns[i]
    if op == 0x1a:
        v = insns[i+1]
        str_id = struct.unpack_from('<H', insns, i+2)[0]
        print(f'{i:04x}: const-string v{v}, "{get_str(str_id)}"')
        i += 4
    elif op in (0x6e, 0x6f, 0x70, 0x71, 0x72):
        meth_id = struct.unpack_from('<H', insns, i+2)[0]
        print(f'{i:04x}: invoke {get_method_name(meth_id)}')
        i += 6
    elif op == 0x22:
        v = insns[i+1]
        t_id = struct.unpack_from('<H', insns, i+2)[0]
        print(f'{i:04x}: new-instance v{v}, {get_type(t_id)}')
        i += 4
    else:
        i += 2

