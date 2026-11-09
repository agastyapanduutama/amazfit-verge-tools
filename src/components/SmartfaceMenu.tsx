import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import { PressableControl } from './PressableControl';

interface SmartfaceMenuProps {
  palette: ColorPalette;
  watchIp?: string;
  onApplyWatchface?: (name: string) => void;
}

interface WatchfaceOption {
  id: string;
  name: string;
  styleTag: string;
  description: string;
  batteryUsage: string;
  timeStyle: 'digital' | 'analog';
  accentHex: string;
  source?: 'system' | 'custom';
}

const DEFAULT_WATCHFACES: WatchfaceOption[] = [
  {
    id: 'wf-sport-cyber',
    name: 'Verge Sport Cyber',
    styleTag: 'Digital Atletik',
    description: 'Tampilan digital dengan aksen neon merah, metrik langkah & kalori aktif.',
    batteryUsage: 'Hemat Daya',
    timeStyle: 'digital',
    accentHex: '#E63946',
    source: 'system',
  },
  {
    id: 'wf-classic-chrono',
    name: 'Classic Chronograph',
    styleTag: 'Analog Elegan',
    description: 'Jarum jam klasik dengan dial detik terpisah dan tanggal aktif.',
    batteryUsage: 'Standar',
    timeStyle: 'analog',
    accentHex: '#38BDF8',
    source: 'system',
  },
  {
    id: 'wf-minimal-dark',
    name: 'Minimalist Clean',
    styleTag: 'Tipografi Ramping',
    description: 'Fokus waktu bersih dengan efisiensi piksel hitam AMOLED murni.',
    batteryUsage: 'Paling Hemat',
    timeStyle: 'digital',
    accentHex: '#10B981',
    source: 'system',
  },
  {
    id: 'wf-dashboard-pro',
    name: 'Active Dashboard',
    styleTag: 'Multi Metrik',
    description: 'Informasi cuaca, detak jantung, baterai, dan target berdiri lengkap.',
    batteryUsage: 'Standar',
    timeStyle: 'digital',
    accentHex: '#F59E0B',
    source: 'system',
  },
];

export function SmartfaceMenu({
  palette,
  watchIp,
  onApplyWatchface,
}: SmartfaceMenuProps) {
  const [faces, setFaces] = useState<WatchfaceOption[]>(DEFAULT_WATCHFACES);
  const [selectedId, setSelectedId] = useState('wf-sport-cyber');
  const [appliedId, setAppliedId] = useState('wf-sport-cyber');
  const [isApplying, setIsApplying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const fetchWatchfacesFromWatch = async () => {
    if (!watchIp) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`http://${watchIp.trim()}:8080/watchfaces`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.watchfaces && Array.isArray(data.watchfaces) && data.watchfaces.length > 0) {
        const parsed: WatchfaceOption[] = data.watchfaces.map((item: any, idx: number) => ({
          id: item.id || `wf-remote-${idx}`,
          name: item.name,
          styleTag: item.source === 'custom' ? 'Kustom (.wfz)' : 'Sistem Verge',
          description:
            item.source === 'custom'
              ? `Tampilan jam kustom ${item.filename || item.name} terpasang di jam tangan.`
              : `Tampilan jam bawaan dari sistem Amazfit Verge (Huami OS).`,
          batteryUsage: 'Optimal',
          timeStyle: idx % 2 === 0 ? 'digital' : 'analog',
          accentHex: ['#E63946', '#38BDF8', '#10B981', '#F59E0B', '#818CF8'][idx % 5],
          source: item.source,
        }));
        setFaces(parsed);
        if (parsed.length > 0) {
          setSelectedId(parsed[0].id);
        }
        setSyncStatus(`Memuat ${parsed.length} watchface langsung dari jam tangan.`);
      }
    } catch {
      setSyncStatus('Menggunakan daftar watchface bawaan sistem Amazfit.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (watchIp) {
      fetchWatchfacesFromWatch();
    }
  }, [watchIp]);

  const currentFace = faces.find((w) => w.id === selectedId) || faces[0] || DEFAULT_WATCHFACES[0];

  const handleApply = async () => {
    setIsApplying(true);
    if (watchIp) {
      try {
        await fetch(
          `http://${watchIp.trim()}:8080/watchface?name=${encodeURIComponent(currentFace.name)}`,
          { method: 'POST' }
        );
      } catch {
        // Silently handled
      }
    }
    if (onApplyWatchface) {
      onApplyWatchface(currentFace.name);
    }
    setTimeout(() => {
      setAppliedId(selectedId);
      setIsApplying(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Circular AMOLED Watch Bezel Preview */}
      <View
        style={[
          styles.previewContainer,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.sectionSubtitle, { color: palette.textSecondary }]}>
          PRATINJAU LAYAR BULAT AMOLED 1.3" (360×360)
        </Text>

        {/* Circular Verge Bezel */}
        <View style={styles.watchBezel}>
          <View style={[styles.watchScreen, { borderColor: currentFace.accentHex }]}>
            {/* Top Date */}
            <Text style={styles.watchDate}>SEN, 09 NOV</Text>

            {/* Center Time */}
            {currentFace.timeStyle === 'digital' ? (
              <View style={styles.digitalTimeBlock}>
                <Text style={styles.watchTimeMain}>15:30</Text>
                <Text style={[styles.watchSec, { color: currentFace.accentHex }]}>
                  45
                </Text>
              </View>
            ) : (
              <View style={styles.analogClockMock}>
                <View style={styles.clockCenterDot} />
                <View style={[styles.clockHourHand, { backgroundColor: '#F8FAFC' }]} />
                <View style={[styles.clockMinuteHand, { backgroundColor: currentFace.accentHex }]} />
              </View>
            )}

            {/* Bottom Sub-metrics */}
            <View style={styles.watchBottomMetrics}>
              <Text style={styles.watchMetricText}>6,840 st</Text>
              <Text style={styles.watchMetricDot}>•</Text>
              <Text style={[styles.watchMetricText, { color: currentFace.accentHex }]}>
                74 bpm
              </Text>
              <Text style={styles.watchMetricDot}>•</Text>
              <Text style={styles.watchMetricText}>82%</Text>
            </View>
          </View>
        </View>

        <View style={styles.faceStatusBlock}>
          <Text style={[styles.faceNameHeading, { color: palette.textPrimary }]}>
            {currentFace.name}
          </Text>
          <Text style={[styles.faceDescription, { color: palette.textSecondary }]}>
            {currentFace.description}
          </Text>
        </View>

        {/* Apply CTA */}
        <PressableControl
          palette={palette}
          accessibilityLabel={`Terapkan tema watch face ${currentFace.name} ke jam`}
          onPress={handleApply}
          disabled={isApplying || appliedId === selectedId}
          style={[
            styles.applyBtn,
            {
              backgroundColor:
                appliedId === selectedId
                  ? palette.surfaceSecondary
                  : palette.accent,
              borderColor: palette.borderStrong,
            },
          ]}
        >
          <Text
            style={[
              styles.applyBtnText,
              {
                color:
                  appliedId === selectedId
                    ? palette.textSecondary
                    : palette.accentText,
              },
            ]}
          >
            {isApplying
              ? 'Menerapkan ke Jam...'
              : appliedId === selectedId
                ? 'Watchface Sedang Aktif'
                : 'Terapkan ke Jam Tangan'}
          </Text>
        </PressableControl>
      </View>

      {/* Watchface Selection Grid */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              Koleksi Watch Face Amazfit Verge
            </Text>
            <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
              {syncStatus || 'Data tampilan jam diambil langsung dari sistem jam tangan.'}
            </Text>
          </View>
          <PressableControl
            palette={palette}
            accessibilityLabel="Sinkronkan watch face dari jam tangan"
            onPress={fetchWatchfacesFromWatch}
            style={[
              styles.syncBtn,
              {
                backgroundColor: palette.surfaceSecondary,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.syncBtnText, { color: palette.accent }]}>
              {isSyncing ? 'Memuat...' : 'Sinkron'}
            </Text>
          </PressableControl>
        </View>

        <View style={styles.faceList}>
          {faces.map((face) => {
            const isSelected = face.id === selectedId;
            const isCurrentActive = face.id === appliedId;

            return (
              <PressableControl
                key={face.id}
                palette={palette}
                accessibilityLabel={`Pilih watch face ${face.name}`}
                onPress={() => setSelectedId(face.id)}
                style={[
                  styles.faceItem,
                  {
                    backgroundColor: isSelected
                      ? palette.surfaceSecondary
                      : palette.surface,
                    borderColor: isSelected ? palette.accent : palette.border,
                  },
                ]}
              >
                <View style={styles.faceItemLeft}>
                  <View
                    style={[
                      styles.faceColorPip,
                      { backgroundColor: face.accentHex },
                    ]}
                  />
                  <View>
                    <View style={styles.faceTitleRow}>
                      <Text style={[styles.faceItemName, { color: palette.textPrimary }]}>
                        {face.name}
                      </Text>
                      {isCurrentActive && (
                        <View
                          style={[
                            styles.activeBadge,
                            { backgroundColor: palette.statusOkBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activeBadgeText,
                              { color: palette.statusOkText },
                            ]}
                          >
                            Digunakan
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.faceItemMeta,
                        { color: palette.textSecondary },
                      ]}
                    >
                      {face.styleTag} • {face.batteryUsage}
                    </Text>
                  </View>
                </View>
              </PressableControl>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  previewContainer: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  watchBezel: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#05070D',
    borderWidth: 8,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  watchScreen: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: '#000000',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  watchDate: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  digitalTimeBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },
  watchTimeMain: {
    fontSize: 38,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -1,
    lineHeight: 44,
  },
  watchSec: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  analogClockMock: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  clockCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F8FAFC',
    zIndex: 10,
  },
  clockHourHand: {
    position: 'absolute',
    width: 3,
    height: 20,
    top: 16,
    borderRadius: 2,
  },
  clockMinuteHand: {
    position: 'absolute',
    width: 2,
    height: 28,
    top: 8,
    borderRadius: 1,
  },
  watchBottomMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  watchMetricText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  watchMetricDot: {
    fontSize: 8,
    color: '#64748B',
  },
  faceStatusBlock: {
    alignItems: 'center',
    gap: 4,
  },
  faceNameHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  faceDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  applyBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  faceList: {
    gap: 8,
  },
  faceItem: {
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  faceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faceColorPip: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  faceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faceItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  faceItemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
});
