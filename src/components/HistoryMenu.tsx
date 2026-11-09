import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import { CommandLogEntry } from '../types/workout';
import { PressableControl } from './PressableControl';

interface HistoryMenuProps {
  palette: ColorPalette;
  logs: CommandLogEntry[];
  onClearLogs?: () => void;
}

interface ActivityRecord {
  id: string;
  sportTitle: string;
  dateLabel: string;
  durationLabel: string;
  distanceKm: number;
  caloriesKcal: number;
  avgHrBpm: number;
}

const PAST_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-1',
    sportTitle: 'Jalan Kaki',
    dateLabel: 'Hari ini, 06:45',
    durationLabel: '38m 20s',
    distanceKm: 3.24,
    caloriesKcal: 184,
    avgHrBpm: 104,
  },
  {
    id: 'act-2',
    sportTitle: 'Lari Luar Ruang',
    dateLabel: 'Kemarin, 16:30',
    durationLabel: '28m 45s',
    distanceKm: 4.85,
    caloriesKcal: 312,
    avgHrBpm: 148,
  },
  {
    id: 'act-3',
    sportTitle: 'Bersepeda Luar',
    dateLabel: '07 Nov, 07:15',
    durationLabel: '45m 10s',
    distanceKm: 12.4,
    caloriesKcal: 420,
    avgHrBpm: 132,
  },
  {
    id: 'act-4',
    sportTitle: 'Treadmill',
    dateLabel: '05 Nov, 18:20',
    durationLabel: '25m 00s',
    distanceKm: 3.1,
    caloriesKcal: 215,
    avgHrBpm: 128,
  },
];

export function HistoryMenu({
  palette,
  logs,
  onClearLogs,
}: HistoryMenuProps) {
  const [activeSubTab, setActiveSubTab] = useState<'workouts' | 'diagnostics'>('workouts');

  const totalDistance = PAST_ACTIVITIES.reduce((acc, a) => acc + a.distanceKm, 0).toFixed(1);
  const totalCalories = PAST_ACTIVITIES.reduce((acc, a) => acc + a.caloriesKcal, 0);

  return (
    <View style={styles.container}>
      {/* Sub-tab switcher */}
      <View
        style={[
          styles.subTabRow,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <PressableControl
          palette={palette}
          accessibilityLabel="Tampilkan daftar riwayat sesi olahraga"
          onPress={() => setActiveSubTab('workouts')}
          style={[
            styles.subTabBtn,
            {
              backgroundColor:
                activeSubTab === 'workouts'
                  ? palette.accent
                  : 'transparent',
            },
          ]}
        >
          <Text
            style={[
              styles.subTabBtnText,
              {
                color:
                  activeSubTab === 'workouts'
                    ? palette.accentText
                    : palette.textPrimary,
              },
            ]}
          >
            Sesi Olahraga ({PAST_ACTIVITIES.length})
          </Text>
        </PressableControl>

        <PressableControl
          palette={palette}
          accessibilityLabel="Tampilkan log diagnostik payload jam tangan"
          onPress={() => setActiveSubTab('diagnostics')}
          style={[
            styles.subTabBtn,
            {
              backgroundColor:
                activeSubTab === 'diagnostics'
                  ? palette.accent
                  : 'transparent',
            },
          ]}
        >
          <Text
            style={[
              styles.subTabBtnText,
              {
                color:
                  activeSubTab === 'diagnostics'
                    ? palette.accentText
                    : palette.textPrimary,
              },
            ]}
          >
            Log Transmisi ({logs.length})
          </Text>
        </PressableControl>
      </View>

      {activeSubTab === 'workouts' ? (
        <>
          {/* Weekly Summary Banner */}
          <View
            style={[
              styles.summaryBanner,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>
                Total Jarak
              </Text>
              <Text style={[styles.summaryVal, { color: palette.textPrimary }]}>
                {totalDistance}{' '}
                <Text style={[styles.summaryUnit, { color: palette.textSecondary }]}>
                  km
                </Text>
              </Text>
            </View>

            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: palette.border },
              ]}
            />

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>
                Total Kalori
              </Text>
              <Text style={[styles.summaryVal, { color: palette.textPrimary }]}>
                {totalCalories}{' '}
                <Text style={[styles.summaryUnit, { color: palette.textSecondary }]}>
                  kkal
                </Text>
              </Text>
            </View>

            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: palette.border },
              ]}
            />

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>
                Sesi Minggu Ini
              </Text>
              <Text style={[styles.summaryVal, { color: palette.textPrimary }]}>
                {PAST_ACTIVITIES.length}{' '}
                <Text style={[styles.summaryUnit, { color: palette.textSecondary }]}>
                  kali
                </Text>
              </Text>
            </View>
          </View>

          {/* List of Workouts */}
          <View style={styles.activityList}>
            {PAST_ACTIVITIES.map((act) => (
              <View
                key={act.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View style={styles.activityTop}>
                  <View>
                    <Text style={[styles.actTitle, { color: palette.textPrimary }]}>
                      {act.sportTitle}
                    </Text>
                    <Text style={[styles.actDate, { color: palette.textSecondary }]}>
                      {act.dateLabel}
                    </Text>
                  </View>
                  <Text style={[styles.actDistance, { color: palette.accent }]}>
                    {act.distanceKm} km
                  </Text>
                </View>

                <View
                  style={[
                    styles.actMetaRow,
                    { borderTopColor: palette.border },
                  ]}
                >
                  <Text style={[styles.actMetaText, { color: palette.textSecondary }]}>
                    Durasi: <Text style={{ color: palette.textPrimary }}>{act.durationLabel}</Text>
                  </Text>
                  <Text style={[styles.actMetaText, { color: palette.textSecondary }]}>
                    Kalori: <Text style={{ color: palette.textPrimary }}>{act.caloriesKcal} kkal</Text>
                  </Text>
                  <Text style={[styles.actMetaText, { color: palette.textSecondary }]}>
                    Avg HR: <Text style={{ color: palette.textPrimary }}>{act.avgHrBpm} BPM</Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        /* Diagnostics Log Subtab */
        <View
          style={[
            styles.logCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.logHeader}>
            <View>
              <Text style={[styles.logTitle, { color: palette.textPrimary }]}>
                Log Transmisi Pemicu Jam
              </Text>
              <Text style={[styles.logSubtitle, { color: palette.textSecondary }]}>
                Catatan byte protokol Huami OS dan HTTP Hotspot
              </Text>
            </View>
            {onClearLogs && (
              <PressableControl
                palette={palette}
                accessibilityLabel="Bersihkan riwayat log transmisi"
                onPress={onClearLogs}
                style={[
                  styles.clearBtn,
                  {
                    backgroundColor: palette.surfaceSecondary,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={[styles.clearBtnText, { color: palette.textPrimary }]}>
                  Hapus Log
                </Text>
              </PressableControl>
            )}
          </View>

          {logs.length === 0 ? (
            <View style={styles.emptyLogBox}>
              <Text style={[styles.emptyLogText, { color: palette.textSecondary }]}>
                Belum ada transmisi sinyal pada sesi ini.
              </Text>
            </View>
          ) : (
            <View style={styles.logList}>
              {logs.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.logItem,
                    {
                      backgroundColor: palette.surfaceSecondary,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.logItemTop}>
                    <Text style={[styles.logAction, { color: palette.textPrimary }]}>
                      {item.actionLabel}
                    </Text>
                    <Text style={[styles.logTime, { color: palette.textSecondary }]}>
                      {item.timestamp}
                    </Text>
                  </View>
                  <Text style={[styles.logDetail, { color: palette.textSecondary }]}>
                    {item.detail}
                  </Text>
                  {item.hexPayload && (
                    <Text style={[styles.logHex, { color: palette.accent }]}>
                      HEX: {item.hexPayload}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  subTabRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  subTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  summaryUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  activityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  actTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  actDate: {
    fontSize: 12,
    marginTop: 2,
  },
  actDistance: {
    fontSize: 20,
    fontWeight: '800',
  },
  actMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actMetaText: {
    fontSize: 11,
  },
  logCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  logSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyLogBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyLogText: {
    fontSize: 13,
  },
  logList: {
    gap: 8,
  },
  logItem: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  logItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logAction: {
    fontSize: 13,
    fontWeight: '700',
  },
  logTime: {
    fontSize: 11,
  },
  logDetail: {
    fontSize: 12,
    lineHeight: 16,
  },
  logHex: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
