export type AppTab =
  | 'health'
  | 'sport'
  | 'heart_rate'
  | 'history'
  | 'alarm'
  | 'smartface';

export interface TabItem {
  id: AppTab;
  label: string;
  shortLabel: string;
  description: string;
}

export const APP_TABS: TabItem[] = [
  {
    id: 'health',
    label: 'Aktivitas',
    shortLabel: 'Health',
    description: 'Ringkasan langkah, kalori, dan capaian harian',
  },
  {
    id: 'sport',
    label: 'Olahraga',
    shortLabel: 'Sport',
    description: 'Pemicu latihan dan anti ghost-touch',
  },
  {
    id: 'heart_rate',
    label: 'Detak Jantung',
    shortLabel: 'Jantung',
    description: 'Monitor denyut nadi dan zona latihan',
  },
  {
    id: 'history',
    label: 'Riwayat',
    shortLabel: 'Riwayat',
    description: 'Catatan sesi latihan dan log transmisi',
  },
  {
    id: 'alarm',
    label: 'Alarm',
    shortLabel: 'Alarm',
    description: 'Jadwal alarm dan pemicu getar jam',
  },
  {
    id: 'smartface',
    label: 'Smartface',
    shortLabel: 'Watchface',
    description: 'Pilihan tampilan dial jam tangan Verge',
  },
];

