export type WorkoutCategory = 'outdoor' | 'indoor';

export type WorkoutId =
  | 'outdoor_run'
  | 'trail_run'
  | 'walking'
  | 'outdoor_cycling'
  | 'treadmill'
  | 'indoor_cycling'
  | 'elliptical'
  | 'freestyle';

export interface WorkoutMode {
  id: WorkoutId;
  channelCode: string;
  title: string;
  WatchLabel: string;
  category: WorkoutCategory;
  requiresGps: boolean;
  huamiOpCode: number;
  hexPayloadPreview: string;
  shortDescription: string;
  recommendedScreenLock: boolean;
}

export type ConnectionMode = 'ble' | 'simulation' | 'wifi_hotspot';

export type BleConnectionStatus =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'error';

export type ActiveSessionState = 'idle' | 'running' | 'paused';

export interface DiscoveredWatch {
  id: string;
  name: string;
  rssi: number | null;
  isVergeLiteCandidate: boolean;
}

export interface CommandLogEntry {
  id: string;
  timestamp: string;
  actionLabel: string;
  hexPayload: string;
  transport: ConnectionMode;
  status: 'sent' | 'error';
  detail: string;
}

// Huami/Zepp GATT UUIDs used by Amazfit Verge (A1811) and Verge Lite (A1818)
export const HUAMI_BLE_UUIDS = {
  PRIMARY_SERVICE: '0000fee0-0000-1000-8000-00805f9b34fb',
  AUTH_SERVICE: '0000fee1-0000-1000-8000-00805f9b34fb',
  CONTROL_CHAR: '00000003-0000-3512-2118-0009af100700',
  AUTH_CHAR: '00000009-0000-3512-2118-0009af100700',
  ALERT_CHAR: '00002a46-0000-1000-8000-00805f9b34fb',
} as const;

export const WORKOUT_MODES: WorkoutMode[] = [
  {
    id: 'outdoor_run',
    channelCode: 'CH-01',
    title: 'Lari Outdoor',
    WatchLabel: 'Outdoor Run',
    category: 'outdoor',
    requiresGps: true,
    huamiOpCode: 0x01,
    hexPayloadPreview: '06 17 00 01 01',
    shortDescription: 'Perekaman rute GPS penuh, kecepatan per km, dan detak jantung.',
    recommendedScreenLock: true,
  },
  {
    id: 'trail_run',
    channelCode: 'CH-02',
    title: 'Lari Trail',
    WatchLabel: 'Trail Run',
    category: 'outdoor',
    requiresGps: true,
    huamiOpCode: 0x02,
    hexPayloadPreview: '06 17 00 02 01',
    shortDescription: 'Lari lintas alam dengan pemantauan elevasi GPS dan kunci layar anti-ghost touch.',
    recommendedScreenLock: true,
  },
  {
    id: 'walking',
    channelCode: 'CH-03',
    title: 'Berjalan',
    WatchLabel: 'Walking',
    category: 'outdoor',
    requiresGps: true,
    huamiOpCode: 0x03,
    hexPayloadPreview: '06 17 00 03 01',
    shortDescription: 'Jalan kaki luar ruang dengan pelacakan langkah, jarak GPS, dan detak jantung.',
    recommendedScreenLock: true,
  },
  {
    id: 'outdoor_cycling',
    channelCode: 'CH-04',
    title: 'Bersepeda Outdoor',
    WatchLabel: 'Outdoor Cycling',
    category: 'outdoor',
    requiresGps: true,
    huamiOpCode: 0x04,
    hexPayloadPreview: '06 17 00 04 01',
    shortDescription: 'Sepeda luar ruang dengan pelacakan kecepatan GPS dan kunci layar otomatis.',
    recommendedScreenLock: true,
  },
  {
    id: 'treadmill',
    channelCode: 'CH-05',
    title: 'Treadmill',
    WatchLabel: 'Indoor Run',
    category: 'indoor',
    requiresGps: false,
    huamiOpCode: 0x05,
    hexPayloadPreview: '06 17 00 05 01',
    shortDescription: 'Lari dalam ruangan berbasis sensor akselerometer tanpa mengaktifkan GPS.',
    recommendedScreenLock: true,
  },
  {
    id: 'indoor_cycling',
    channelCode: 'CH-06',
    title: 'Sepeda Statis',
    WatchLabel: 'Indoor Cycling',
    category: 'indoor',
    requiresGps: false,
    huamiOpCode: 0x06,
    hexPayloadPreview: '06 17 00 06 01',
    shortDescription: 'Latihan sepeda dalam ruangan fokus pada zona detak jantung dan durasi.',
    recommendedScreenLock: false,
  },
  {
    id: 'elliptical',
    channelCode: 'CH-07',
    title: 'Elliptical',
    WatchLabel: 'Elliptical Trainer',
    category: 'indoor',
    requiresGps: false,
    huamiOpCode: 0x07,
    hexPayloadPreview: '06 17 00 07 01',
    shortDescription: 'Latihan kardio mesin eliptikal berbasis irama langkah dan detak jantung.',
    recommendedScreenLock: false,
  },
  {
    id: 'freestyle',
    channelCode: 'CH-08',
    title: 'Freestyle / Gym',
    WatchLabel: 'Exercise',
    category: 'indoor',
    requiresGps: false,
    huamiOpCode: 0x08,
    hexPayloadPreview: '06 17 00 08 01',
    shortDescription: 'Latihan beban, senam, atau olahraga bebas dengan pencatatan kalori dan syaraf detak.',
    recommendedScreenLock: false,
  },
];

