import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import { PressableControl } from './PressableControl';

interface AlarmMenuProps {
  palette: ColorPalette;
  onTestVibrate?: () => void;
}

interface AlarmItem {
  id: string;
  timeLabel: string;
  title: string;
  repeatLabel: string;
  isEnabled: boolean;
}

const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: 'alm-1',
    timeLabel: '05:30',
    title: 'Bangun Pagi',
    repeatLabel: 'Senin - Jumat',
    isEnabled: true,
  },
  {
    id: 'alm-2',
    timeLabel: '06:15',
    title: 'Lari Pagi & Olahraga',
    repeatLabel: 'Sabtu, Minggu',
    isEnabled: true,
  },
  {
    id: 'alm-3',
    timeLabel: '12:30',
    title: 'Istirahat Siang',
    repeatLabel: 'Senin - Jumat',
    isEnabled: false,
  },
  {
    id: 'alm-4',
    timeLabel: '22:00',
    title: 'Persiapan Tidur',
    repeatLabel: 'Setiap Hari',
    isEnabled: true,
  },
];

export function AlarmMenu({ palette, onTestVibrate }: AlarmMenuProps) {
  const [alarms, setAlarms] = useState<AlarmItem[]>(DEFAULT_ALARMS);
  const [isVibrating, setIsVibrating] = useState(false);

  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const handleTestVibrateTrigger = () => {
    setIsVibrating(true);
    if (onTestVibrate) {
      onTestVibrate();
    }
    setTimeout(() => {
      setIsVibrating(false);
    }, 1800);
  };

  return (
    <View style={styles.container}>
      {/* Test Vibrate Hero Box */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>
          GETAR ALARM VERGE
        </Text>
        <Text style={[styles.heroTitle, { color: palette.textPrimary }]}>
          Uji Getaran & Alarm Jam
        </Text>
        <Text style={[styles.heroDescription, { color: palette.textSecondary }]}>
          Picu motor getar linier Amazfit Verge langsung tanpa menyentuh layar jam tangan.
        </Text>

        <PressableControl
          palette={palette}
          accessibilityLabel="Uji getar alarm pada jam tangan"
          onPress={handleTestVibrateTrigger}
          disabled={isVibrating}
          style={[
            styles.vibrateBtn,
            {
              backgroundColor: isVibrating
                ? palette.statusOkBg
                : palette.accent,
              borderColor: palette.borderStrong,
            },
          ]}
        >
          <Text
            style={[
              styles.vibrateBtnText,
              {
                color: isVibrating
                  ? palette.statusOkText
                  : palette.accentText,
              },
            ]}
          >
            {isVibrating ? 'Jam Tangan Sedang Bergetar...' : 'Picu Getar Jam Sekarang'}
          </Text>
        </PressableControl>
      </View>

      {/* Alarms List */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
            Daftar Alarm Jam Tangan
          </Text>
          <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
            Alarm aktif tetap berbunyi/bergetar saat jam tidak terhubung HP
          </Text>
        </View>

        <View style={styles.alarmList}>
          {alarms.map((item) => (
            <View
              key={item.id}
              style={[
                styles.alarmItem,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.alarmLeft}>
                <Text
                  style={[
                    styles.alarmTime,
                    {
                      color: item.isEnabled
                        ? palette.textPrimary
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {item.timeLabel}
                </Text>
                <View>
                  <Text
                    style={[
                      styles.alarmName,
                      {
                        color: item.isEnabled
                          ? palette.textPrimary
                          : palette.textSecondary,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.alarmRepeat,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {item.repeatLabel}
                  </Text>
                </View>
              </View>

              <PressableControl
                palette={palette}
                accessibilityLabel={`Ubah status alarm ${item.title}`}
                onPress={() => handleToggleAlarm(item.id)}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: item.isEnabled
                      ? palette.accent
                      : palette.surface,
                    borderColor: item.isEnabled
                      ? palette.borderStrong
                      : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    {
                      color: item.isEnabled
                        ? palette.accentText
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {item.isEnabled ? 'Aktif' : 'Mati'}
                </Text>
              </PressableControl>
            </View>
          ))}
        </View>

        {/* Add Alarm Placeholder */}
        <PressableControl
          palette={palette}
          accessibilityLabel="Tambah alarm baru"
          onPress={() => {
            const newId = `alm-${Date.now()}`;
            setAlarms((prev) => [
              ...prev,
              {
                id: newId,
                timeLabel: '07:00',
                title: 'Alarm Baru',
                repeatLabel: 'Sekali saja',
                isEnabled: true,
              },
            ]);
          }}
          style={[
            styles.addAlarmBtn,
            {
              backgroundColor: palette.surfaceSecondary,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.addAlarmText, { color: palette.textPrimary }]}>
            + Tambah Jadwal Alarm
          </Text>
        </PressableControl>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heroCard: {
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  vibrateBtn: {
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 6,
  },
  vibrateBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  alarmList: {
    gap: 10,
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  alarmLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  alarmTime: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  alarmName: {
    fontSize: 13,
    fontWeight: '600',
  },
  alarmRepeat: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addAlarmBtn: {
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  addAlarmText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
