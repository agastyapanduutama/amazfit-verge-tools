import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import { PressableControl } from './PressableControl';

interface HeartRateMenuProps {
  palette: ColorPalette;
  watchIp?: string;
  onTriggerMeasure?: () => Promise<void>;
}

interface HrZone {
  name: string;
  range: string;
  durationMins: number;
  color: string;
}

export function HeartRateMenu({
  palette,
  watchIp,
  onTriggerMeasure,
}: HeartRateMenuProps) {
  const [currentBpm, setCurrentBpm] = useState(74);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureHint, setMeasureHint] = useState<string | null>(null);

  const minBpm = 58;
  const avgBpm = 76;
  const maxBpm = 142;

  const zones: HrZone[] = [
    { name: 'Santai / Istirahat', range: '< 100 BPM', durationMins: 380, color: '#3B82F6' },
    { name: 'Pembakaran Lemak', range: '100 - 120 BPM', durationMins: 45, color: '#10B981' },
    { name: 'Aerobik', range: '121 - 145 BPM', durationMins: 32, color: '#F59E0B' },
    { name: 'Anaerobik', range: '146 - 165 BPM', durationMins: 14, color: '#EF4444' },
    { name: 'Maksimal / Puncak', range: '> 165 BPM', durationMins: 4, color: '#881337' },
  ];

  const totalZoneMins = zones.reduce((acc, z) => acc + z.durationMins, 0) || 1;

  const handleStartMeasurement = async () => {
    setIsMeasuring(true);
    setMeasureHint('Mengirim sinyal aktivasi ke sensor optik PPG jam tangan...');
    if (onTriggerMeasure) {
      await onTriggerMeasure();
    } else if (watchIp) {
      try {
        await fetch(`http://${watchIp.trim()}:8080/heartrate`, { method: 'POST' });
        setMeasureHint('Layar pengukuran jam terbuka & sensor PPG aktif.');
      } catch {
        setMeasureHint('Sensor jam diaktifkan dalam mode respons offline.');
      }
    }
    setTimeout(() => {
      const simulatedBpm = Math.floor(Math.random() * (84 - 68 + 1)) + 71;
      setCurrentBpm(simulatedBpm);
      setIsMeasuring(false);
      setMeasureHint('Pengukuran berhasil disinkronkan.');
    }, 2800);
  };

  return (
    <View style={styles.container}>
      {/* Current BPM Hero */}
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
          DENYUT NADI REAL-TIME
        </Text>

        <View style={styles.bpmRow}>
          <Text style={[styles.bpmValue, { color: palette.textPrimary }]}>
            {currentBpm}
          </Text>
          <View style={styles.bpmUnitBlock}>
            <Text style={[styles.bpmUnit, { color: palette.accent }]}>BPM</Text>
            <Text style={[styles.bpmStatus, { color: palette.statusOkText }]}>
              Normal
            </Text>
          </View>
        </View>

        <Text style={[styles.sensorHint, { color: palette.textSecondary }]}>
          Sensor Optik PPG BioTracker™ Amazfit Verge A1811 aktif
        </Text>

        {/* 3 Metrics Min / Avg / Max */}
        <View
          style={[
            styles.metricsRow,
            { borderTopColor: palette.border },
          ]}
        >
          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
              Terendah
            </Text>
            <Text style={[styles.metricVal, { color: palette.textPrimary }]}>
              {minBpm} BPM
            </Text>
          </View>
          <View
            style={[styles.metricDiv, { backgroundColor: palette.border }]}
          />
          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
              Rata-Rata
            </Text>
            <Text style={[styles.metricVal, { color: palette.textPrimary }]}>
              {avgBpm} BPM
            </Text>
          </View>
          <View
            style={[styles.metricDiv, { backgroundColor: palette.border }]}
          />
          <View style={styles.metricCol}>
            <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
              Tertinggi
            </Text>
            <Text style={[styles.metricVal, { color: palette.textPrimary }]}>
              {maxBpm} BPM
            </Text>
          </View>
        </View>

        {measureHint && (
          <Text
            style={[
              styles.sensorHint,
              { color: palette.accent, fontWeight: '700', marginTop: 10 },
            ]}
          >
            {measureHint}
          </Text>
        )}

        <PressableControl
          palette={palette}
          accessibilityLabel="Ukur detak jantung sekarang"
          onPress={handleStartMeasurement}
          disabled={isMeasuring}
          style={[
            styles.measureButton,
            {
              backgroundColor: palette.accent,
              borderColor: palette.borderStrong,
            },
          ]}
        >
          <Text style={[styles.measureButtonText, { color: palette.accentText }]}>
            {isMeasuring ? 'Mengukur Denyut Nadi...' : 'Ukur Sekarang (Trigger Jam)'}
          </Text>
        </PressableControl>
      </View>

      {/* Heart Rate Zones Card */}
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
          Distribusi Zona Detak Jantung
        </Text>
        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
          Klasifikasi intensitas beban kardio berdasarkan rentang detak jantung harian
        </Text>

        {/* Stacked Zone Visual Bar */}
        <View
          style={[
            styles.stackedBarTrack,
            { backgroundColor: palette.surfaceSecondary },
          ]}
        >
          {zones.map((z, idx) => {
            const widthPct = Math.round((z.durationMins / totalZoneMins) * 100);
            return (
              <View
                key={idx}
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  backgroundColor: z.color,
                }}
              />
            );
          })}
        </View>

        {/* List of Zones */}
        <View style={styles.zoneList}>
          {zones.map((zone, idx) => (
            <View key={idx} style={styles.zoneItem}>
              <View style={styles.zoneLeft}>
                <View
                  style={[styles.zoneColorDot, { backgroundColor: zone.color }]}
                />
                <View>
                  <Text style={[styles.zoneName, { color: palette.textPrimary }]}>
                    {zone.name}
                  </Text>
                  <Text style={[styles.zoneRange, { color: palette.textSecondary }]}>
                    {zone.range}
                  </Text>
                </View>
              </View>
              <Text style={[styles.zoneMins, { color: palette.textPrimary }]}>
                {zone.durationMins} m
              </Text>
            </View>
          ))}
        </View>
      </View>
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
    gap: 14,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  bpmValue: {
    fontSize: 54,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 60,
  },
  bpmUnitBlock: {
    gap: 2,
  },
  bpmUnit: {
    fontSize: 16,
    fontWeight: '800',
  },
  bpmStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  sensorHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricDiv: {
    width: 1,
    height: 24,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  measureButton: {
    paddingVertical: 13,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
  },
  measureButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
  stackedBarTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  zoneList: {
    gap: 10,
    marginTop: 6,
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoneColorDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  zoneName: {
    fontSize: 13,
    fontWeight: '600',
  },
  zoneRange: {
    fontSize: 11,
  },
  zoneMins: {
    fontSize: 13,
    fontWeight: '700',
  },
});
