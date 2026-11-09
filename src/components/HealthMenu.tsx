import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import { PressableControl } from './PressableControl';

interface HealthMenuProps {
  palette: ColorPalette;
  onSyncWithWatch?: () => void;
  isSyncing?: boolean;
}

export function HealthMenu({
  palette,
  onSyncWithWatch,
  isSyncing = false,
}: HealthMenuProps) {
  const [steps, setSteps] = useState(6840);
  const stepTarget = 8000;
  const calories = 342;
  const distanceKm = 4.78;
  const activeMinutes = 48;
  const progressPercent = Math.min(100, Math.round((steps / stepTarget) * 100));

  return (
    <View style={styles.container}>
      {/* Hero Daily Summary Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>
              RINGKASAN HARI INI
            </Text>
            <Text style={[styles.heroMainValue, { color: palette.textPrimary }]}>
              {steps.toLocaleString('id-ID')}
              <Text style={[styles.heroUnit, { color: palette.textSecondary }]}>
                {' '}
                / {stepTarget.toLocaleString('id-ID')} langkah
              </Text>
            </Text>
          </View>
          <View
            style={[
              styles.percentBadge,
              {
                backgroundColor: palette.statusOkBg,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.percentText, { color: palette.statusOkText }]}>
              {progressPercent}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressBarTrack,
            { backgroundColor: palette.surfaceSecondary },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: palette.accent,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>

        {/* 3 Metric Columns */}
        <View
          style={[
            styles.metricsRow,
            { borderTopColor: palette.border },
          ]}
        >
          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
              Kalori Aktif
            </Text>
            <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
              {calories}{' '}
              <Text style={[styles.metricUnit, { color: palette.textSecondary }]}>
                kkal
              </Text>
            </Text>
          </View>

          <View
            style={[
              styles.metricDivider,
              { backgroundColor: palette.border },
            ]}
          />

          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
              Jarak Tempuh
            </Text>
            <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
              {distanceKm}{' '}
              <Text style={[styles.metricUnit, { color: palette.textSecondary }]}>
                km
              </Text>
            </Text>
          </View>

          <View
            style={[
              styles.metricDivider,
              { backgroundColor: palette.border },
            ]}
          />

          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
              Waktu Aktif
            </Text>
            <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
              {activeMinutes}{' '}
              <Text style={[styles.metricUnit, { color: palette.textSecondary }]}>
                menit
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Sleep & Recovery Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
          Kualitas Tidur Semalam
        </Text>
        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
          Rekaman sensor gerak tidur Amazfit Verge A1811
        </Text>

        <View style={styles.sleepRow}>
          <View style={styles.sleepMainItem}>
            <Text style={[styles.sleepDuration, { color: palette.textPrimary }]}>
              7j 24m
            </Text>
            <Text style={[styles.sleepScore, { color: palette.statusOkText }]}>
              Skor 86 (Baik)
            </Text>
          </View>

          <View style={styles.sleepBreakdown}>
            <View style={styles.sleepBarSegment}>
              <View
                style={[
                  styles.sleepDot,
                  { backgroundColor: palette.accent },
                ]}
              />
              <Text style={[styles.sleepStatText, { color: palette.textSecondary }]}>
                Tidur Nyenyak: 2j 15m
              </Text>
            </View>
            <View style={styles.sleepBarSegment}>
              <View
                style={[
                  styles.sleepDot,
                  { backgroundColor: palette.textSecondary },
                ]}
              />
              <Text style={[styles.sleepStatText, { color: palette.textSecondary }]}>
                Tidur Ringan: 5j 09m
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stand Hours & Activity Habit */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
          Aktivitas Berdiri & Pengingat Duduk
        </Text>
        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
          Target 12 jam berdiri per hari untuk kesehatan postur tubuh
        </Text>

        <View style={styles.standGrid}>
          {Array.from({ length: 12 }).map((_, idx) => {
            const isCompleted = idx < 9;
            return (
              <View
                key={idx}
                style={[
                  styles.standPill,
                  {
                    backgroundColor: isCompleted
                      ? palette.accent
                      : palette.surfaceSecondary,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.standPillText,
                    {
                      color: isCompleted
                        ? palette.accentText
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {idx + 8}:00
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Sync Control Action */}
      <PressableControl
        palette={palette}
        accessibilityLabel="Perbarui data kesehatan hari ini dari jam tangan"
        onPress={() => {
          if (onSyncWithWatch) {
            onSyncWithWatch();
          } else {
            setSteps((prev) => prev + 120);
          }
        }}
        style={[
          styles.syncButton,
          {
            backgroundColor: palette.accent,
            borderColor: palette.borderStrong,
          },
        ]}
      >
        <Text style={[styles.syncButtonText, { color: palette.accentText }]}>
          {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Hari Ini'}
        </Text>
      </PressableControl>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  heroMainValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sleepMainItem: {
    gap: 2,
  },
  sleepDuration: {
    fontSize: 26,
    fontWeight: '800',
  },
  sleepScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  sleepBreakdown: {
    gap: 6,
  },
  sleepBarSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sleepDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  sleepStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  standGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 4,
  },
  standPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  standPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  syncButton: {
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
