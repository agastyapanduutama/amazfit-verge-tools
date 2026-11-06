import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ThemePalette } from '../theme/palette';
import { CommandLogEntry } from '../types/workout';
import { PressableControl } from './PressableControl';

interface CommandLogPanelProps {
  palette: ThemePalette;
  logs: CommandLogEntry[];
  isSendingCommand: boolean;
  lastError: string | null;
  onClearLogs: () => void;
  onClearError: () => void;
}

export function CommandLogPanel({
  palette,
  logs,
  isSendingCommand,
  lastError,
  onClearLogs,
  onClearError,
}: CommandLogPanelProps) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            Log Transmisi Paket GATT (0xFEE0)
          </Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            Rekaman waktu nyata setiap instruksi trigger yang dikirim ke Amazfit
            Verge A1811.
          </Text>
        </View>

        {logs.length > 0 && (
          <PressableControl
            palette={palette}
            accessibilityLabel="Bersihkan riwayat log paket GATT"
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
              Bersihkan Log ({logs.length})
            </Text>
          </PressableControl>
        )}
      </View>

      {/* R-27: Explicit Loading State */}
      {isSendingCommand && (
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: palette.surfaceSecondary,
              borderColor: palette.border,
            },
          ]}
        >
          <View style={styles.loadingLine}>
            <ActivityIndicator size="small" color={palette.textPrimary} />
            <Text style={[styles.stateTitle, { color: palette.textPrimary }]}>
              Mengirim paket byte ke karakteristik kontrol 0x0003...
            </Text>
          </View>
          <Text style={[styles.stateDesc, { color: palette.textSecondary }]}>
            Menunggu konfirmasi antrean BLE dari jam tangan.
          </Text>
        </View>
      )}

      {/* R-27: Explicit Error State */}
      {lastError && (
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: palette.statusErrorBg,
              borderColor: palette.border,
            },
          ]}
        >
          <Text
            style={[styles.stateTitle, { color: palette.statusErrorText }]}
          >
            Pengiriman Paket Gagal
          </Text>
          <Text style={[styles.stateDesc, { color: palette.statusErrorText }]}>
            {lastError}
          </Text>
          <PressableControl
            palette={palette}
            accessibilityLabel="Tutup pesan kesalahan transmisi"
            onPress={onClearError}
            style={[
              styles.dismissErrorBtn,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Text
              style={[styles.dismissErrorText, { color: palette.textPrimary }]}
            >
              Tutup Pesan
            </Text>
          </PressableControl>
        </View>
      )}

      {/* R-27: Explicit Empty State */}
      {!isSendingCommand && logs.length === 0 && (
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: palette.surfaceSecondary,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.stateTitle, { color: palette.textPrimary }]}>
            Belum Ada Transmisi pada Sesi Ini
          </Text>
          <Text style={[styles.stateDesc, { color: palette.textSecondary }]}>
            Log masih kosong karena belum ada trigger olahraga yang ditekan.
            Pilih salah satu mode olahraga di atas lalu tekan Mulai di Jam atau
            Picu Cepat untuk melihat paket byte yang dikirim.
          </Text>
        </View>
      )}

      {logs.length > 0 && (
        <View style={styles.logList}>
          {logs.map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.logItem,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor:
                    entry.status === 'error'
                      ? palette.statusErrorText
                      : palette.border,
                },
              ]}
            >
              <View style={styles.logHeader}>
                <Text
                  style={[styles.logAction, { color: palette.textPrimary }]}
                >
                  [{entry.timestamp}] {entry.actionLabel}
                </Text>
                <Text
                  style={[
                    styles.logStatusBadge,
                    {
                      color:
                        entry.status === 'error'
                          ? palette.statusErrorText
                          : palette.statusOkText,
                      backgroundColor:
                        entry.status === 'error'
                          ? palette.statusErrorBg
                          : palette.statusOkBg,
                    },
                  ]}
                >
                  {entry.transport === 'simulation'
                    ? 'SIMULASI OK'
                    : entry.status === 'sent'
                      ? 'BLE TERKIRIM'
                      : 'GAGAL'}
                </Text>
              </View>
              <Text style={[styles.logHex, { color: palette.textPrimary }]}>
                Payload GATT: {entry.hexPayload}
              </Text>
              <Text
                style={[styles.logDetail, { color: palette.textSecondary }]}
              >
                {entry.detail}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  titleCol: {
    flex: 1,
    minWidth: 200,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  clearBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stateCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  loadingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stateDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  dismissErrorBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  dismissErrorText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logList: {
    gap: 8,
  },
  logItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  logAction: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  logStatusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logHex: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  logDetail: {
    fontSize: 12,
    lineHeight: 17,
  },
});

