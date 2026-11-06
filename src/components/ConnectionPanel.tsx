import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ThemePalette } from '../theme/palette';
import {
  BleConnectionStatus,
  ConnectionMode,
  DiscoveredWatch,
} from '../types/workout';
import { PressableControl } from './PressableControl';

interface ConnectionPanelProps {
  palette: ThemePalette;
  connectionMode: ConnectionMode;
  bleStatus: BleConnectionStatus;
  wifiStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectedWatchName: string | null;
  connectedWatchId: string | null;
  discoveredWatches: DiscoveredWatch[];
  scanError: string | null;
  manualMac: string;
  authKeyHex: string;
  watchIp: string;
  isTouchLocked: boolean;
  onChangeWatchIp: (ip: string) => void;
  onChangeManualMac: (value: string) => void;
  onChangeAuthKeyHex: (value: string) => void;
  onSwitchConnectionMode: (mode: ConnectionMode) => void;
  onStartScan: () => void;
  onStopScan: () => void;
  onConnectWatch: (watchId: string, watchName: string) => void;
  onDisconnectWatch: () => void;
  onTestWifiConnection: () => void;
  onOpenLauncher: () => void;
  onWakeScreen: () => void;
  onToggleTouchLock: () => void;
  onTapCenter?: () => void;
}

export function ConnectionPanel({
  palette,
  connectionMode,
  bleStatus,
  wifiStatus,
  connectedWatchName,
  connectedWatchId,
  discoveredWatches,
  scanError,
  manualMac,
  authKeyHex,
  watchIp,
  isTouchLocked,
  onChangeWatchIp,
  onChangeManualMac,
  onChangeAuthKeyHex,
  onSwitchConnectionMode,
  onStartScan,
  onStopScan,
  onConnectWatch,
  onDisconnectWatch,
  onTestWifiConnection,
  onOpenLauncher,
  onWakeScreen,
  onToggleTouchLock,
  onTapCenter,
}: ConnectionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isConnected =
    connectionMode === 'simulation' ||
    (connectionMode === 'wifi_hotspot' && wifiStatus === 'connected') ||
    (connectionMode === 'ble' && bleStatus === 'connected');

  let statusText = 'BELUM TERHUBUNG KE JAM';
  if (connectionMode === 'simulation') {
    statusText = 'MODE SIMULASI AKTIF';
  } else if (connectionMode === 'wifi_hotspot') {
    if (wifiStatus === 'connected') {
      statusText = `HOTSPOT TERHUBUNG (${watchIp}:8080)`;
    } else if (wifiStatus === 'connecting') {
      statusText = 'MENGUJI KONEKSI HOTSPOT...';
    } else if (wifiStatus === 'error') {
      statusText = 'HOTSPOT TIDAK DAPAT DITEMUKAN';
    } else {
      statusText = 'HOTSPOT SIAP (TEKAN UJI SAMBUNGAN)';
    }
  } else if (connectionMode === 'ble') {
    if (bleStatus === 'connected') {
      statusText = `TERHUBUNG BLE: ${connectedWatchName || connectedWatchId}`;
    } else if (bleStatus === 'scanning') {
      statusText = 'MEMINDAI BLE...';
    } else if (bleStatus === 'connecting') {
      statusText = 'MENGHUBUNGKAN BLE...';
    } else if (bleStatus === 'error') {
      statusText = 'GANGGUAN KONEKSI BLE';
    }
  }

  const isStatusOk = isConnected;
  const isStatusErr =
    (connectionMode === 'ble' && bleStatus === 'error') ||
    (connectionMode === 'wifi_hotspot' && wifiStatus === 'error');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.statusGroup}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: isStatusOk
                  ? palette.statusOkBg
                  : isStatusErr
                    ? palette.statusErrorBg
                    : palette.surfaceSecondary,
                borderColor: palette.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                {
                  color: isStatusOk
                    ? palette.statusOkText
                    : isStatusErr
                      ? palette.statusErrorText
                      : palette.textPrimary,
                },
              ]}
            >
              {statusText}
            </Text>
          </View>
          <Text style={[styles.targetMeta, { color: palette.textSecondary }]}>
            Target: Amazfit Verge A1811 (Android 5.1 Companion)
          </Text>
        </View>

        <PressableControl
          palette={palette}
          accessibilityLabel={
            isExpanded
              ? 'Tutup panel pengaturan koneksi jam'
              : 'Buka panel pengaturan koneksi jam'
          }
          onPress={() => setIsExpanded((prev) => !prev)}
          style={[
            styles.expandBtn,
            {
              backgroundColor: palette.surfaceSecondary,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.expandBtnText, { color: palette.textPrimary }]}>
            {isExpanded ? 'Tutup Panel' : 'Atur Koneksi'}
          </Text>
        </PressableControl>
      </View>

      <View style={styles.modeSwitchRow}>
        <PressableControl
          palette={palette}
          accessibilityLabel="Gunakan Mode Wi-Fi / Hotspot untuk Amazfit Verge A1811"
          onPress={() => onSwitchConnectionMode('wifi_hotspot')}
          style={[
            styles.modeButton,
            {
              backgroundColor:
                connectionMode === 'wifi_hotspot'
                  ? palette.accent
                  : palette.surfaceSecondary,
              borderColor:
                connectionMode === 'wifi_hotspot'
                  ? palette.borderStrong
                  : palette.border,
            },
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              {
                color:
                  connectionMode === 'wifi_hotspot'
                    ? palette.accentText
                    : palette.textPrimary,
              },
            ]}
          >
            1. Wi-Fi / Hotspot HP
          </Text>
        </PressableControl>

        <PressableControl
          palette={palette}
          accessibilityLabel="Gunakan Mode BLE Langsung"
          onPress={() => onSwitchConnectionMode('ble')}
          style={[
            styles.modeButton,
            {
              backgroundColor:
                connectionMode === 'ble'
                  ? palette.accent
                  : palette.surfaceSecondary,
              borderColor:
                connectionMode === 'ble' ? palette.borderStrong : palette.border,
            },
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              {
                color:
                  connectionMode === 'ble'
                    ? palette.accentText
                    : palette.textPrimary,
              },
            ]}
          >
            2. BLE Langsung
          </Text>
        </PressableControl>

        <PressableControl
          palette={palette}
          accessibilityLabel="Gunakan Mode Simulasi Uji"
          onPress={() => onSwitchConnectionMode('simulation')}
          style={[
            styles.modeButton,
            {
              backgroundColor:
                connectionMode === 'simulation'
                  ? palette.accent
                  : palette.surfaceSecondary,
              borderColor:
                connectionMode === 'simulation'
                  ? palette.borderStrong
                  : palette.border,
            },
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              {
                color:
                  connectionMode === 'simulation'
                    ? palette.accentText
                    : palette.textPrimary,
              },
            ]}
          >
            3. Simulasi
          </Text>
        </PressableControl>
      </View>

      {isExpanded && (
        <View
          style={[
            styles.expandedBody,
            { borderTopColor: palette.border },
          ]}
        >
          {connectionMode === 'wifi_hotspot' && (
            <View style={styles.wifiSection}>
              <View
                style={[
                  styles.stateBox,
                  {
                    backgroundColor: palette.surfaceSecondary,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Text style={[styles.stateTitle, { color: palette.textPrimary }]}>
                  Koneksi Wi-Fi Hotspot Amazfit Verge A1811
                </Text>
                <Text style={[styles.stateBody, { color: palette.textSecondary }]}>
                  Pastikan Hotspot di HP aktif dan jam terhubung ke hotspot.
                  Companion Service di jam tangan aktif di port 8080.
                </Text>
              </View>

              <View style={styles.fieldBlock}>
                <Text
                  style={[styles.fieldLabel, { color: palette.textPrimary }]}
                >
                  Alamat IP Jam Tangan di Hotspot (Port 8080)
                </Text>
                <View style={styles.ipInputRow}>
                  <TextInput
                    value={watchIp}
                    onChangeText={onChangeWatchIp}
                    placeholder="10.86.7.33"
                    placeholderTextColor={palette.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numeric"
                    style={[
                      styles.textInput,
                      styles.ipInputFlex,
                      {
                        backgroundColor: palette.surfaceSecondary,
                        color: palette.textPrimary,
                        borderColor: palette.border,
                      },
                    ]}
                  />
                  <PressableControl
                    palette={palette}
                    accessibilityLabel="Uji sambungan Wi-Fi ke jam tangan"
                    onPress={onTestWifiConnection}
                    style={[
                      styles.testBtn,
                      {
                        backgroundColor: palette.accent,
                        borderColor: palette.borderStrong,
                      },
                    ]}
                  >
                    {wifiStatus === 'connecting' ? (
                      <ActivityIndicator size="small" color={palette.accentText} />
                    ) : (
                      <Text
                        style={[
                          styles.testBtnText,
                          { color: palette.accentText },
                        ]}
                      >
                        Uji Sambung
                      </Text>
                    )}
                  </PressableControl>
                </View>
              </View>

              <View style={styles.quickActionsGrid}>
                <PressableControl
                  palette={palette}
                  accessibilityLabel="Buka menu olahraga pada jam tangan"
                  onPress={onOpenLauncher}
                  style={[
                    styles.quickActionBtn,
                    {
                      backgroundColor: palette.surfaceSecondary,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickActionText,
                      { color: palette.textPrimary },
                    ]}
                  >
                    Buka Menu Olahraga Jam
                  </Text>
                </PressableControl>

                <PressableControl
                  palette={palette}
                  accessibilityLabel="Bangunkan layar jam tangan"
                  onPress={onWakeScreen}
                  style={[
                    styles.quickActionBtn,
                    {
                      backgroundColor: palette.surfaceSecondary,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickActionText,
                      { color: palette.textPrimary },
                    ]}
                  >
                    Bangunkan Layar Jam
                  </Text>
                </PressableControl>

                <PressableControl
                  palette={palette}
                  accessibilityLabel="Kunci atau buka layar sentuh untuk cegah ghost touch"
                  onPress={onToggleTouchLock}
                  style={[
                    styles.quickActionBtn,
                    {
                      backgroundColor: isTouchLocked
                        ? palette.statusOkBg
                        : palette.surfaceSecondary,
                      borderColor: isTouchLocked
                        ? palette.statusOkText
                        : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.quickActionText,
                      {
                        color: isTouchLocked
                          ? palette.statusOkText
                          : palette.textPrimary,
                      },
                    ]}
                  >
                    {isTouchLocked
                      ? 'Layar Terkunci (Anti Ghost-Touch ON)'
                      : 'Kunci Layar (Anti Ghost-Touch OFF)'}
                  </Text>
                </PressableControl>

                {onTapCenter && (
                  <PressableControl
                    palette={palette}
                    accessibilityLabel="Tekan tombol Mulai di tengah layar jam tangan"
                    onPress={onTapCenter}
                    style={[
                      styles.quickActionBtn,
                      {
                        backgroundColor: palette.surfaceSecondary,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickActionText,
                        { color: palette.textPrimary },
                      ]}
                    >
                      Tekan Tombol Mulai di Jam
                    </Text>
                  </PressableControl>
                )}
              </View>
            </View>
          )}

          {connectionMode === 'simulation' && (
            <View
              style={[
                styles.stateBox,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.stateTitle, { color: palette.textPrimary }]}>
                Simulator Protokol Aktif
              </Text>
              <Text style={[styles.stateBody, { color: palette.textSecondary }]}>
                Semua perintah olahraga akan membentuk paket data dan dicatat di
                log bawah tanpa mengirim sinyal fisik.
              </Text>
            </View>
          )}

          {connectionMode === 'ble' && (
            <View style={styles.bleSection}>
              <View style={styles.scanActionRow}>
                {bleStatus === 'scanning' ? (
                  <PressableControl
                    palette={palette}
                    accessibilityLabel="Hentikan pemindaian Bluetooth"
                    onPress={onStopScan}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: palette.surfaceSecondary,
                        borderColor: palette.borderStrong,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: palette.textPrimary },
                      ]}
                    >
                      Hentikan Pemindaian
                    </Text>
                  </PressableControl>
                ) : (
                  <PressableControl
                    palette={palette}
                    accessibilityLabel="Pindai jam BLE di sekitar"
                    onPress={onStartScan}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: palette.accent,
                        borderColor: palette.borderStrong,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: palette.accentText },
                      ]}
                    >
                      Pindai Jam (BLE)
                    </Text>
                  </PressableControl>
                )}

                {bleStatus === 'connected' && (
                  <PressableControl
                    palette={palette}
                    accessibilityLabel="Putuskan koneksi BLE dari jam tangan"
                    onPress={onDisconnectWatch}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: palette.surfaceSecondary,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: palette.textPrimary },
                      ]}
                    >
                      Putuskan Koneksi
                    </Text>
                  </PressableControl>
                )}
              </View>

              {bleStatus === 'scanning' && (
                <View
                  style={[
                    styles.stateBox,
                    {
                      backgroundColor: palette.surfaceSecondary,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={palette.textPrimary} />
                    <Text
                      style={[styles.stateTitle, { color: palette.textPrimary }]}
                    >
                      Memindai sinyal GATT...
                    </Text>
                  </View>
                </View>
              )}

              {scanError && (
                <View
                  style={[
                    styles.stateBox,
                    {
                      backgroundColor: palette.statusErrorBg,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stateTitle,
                      { color: palette.statusErrorText },
                    ]}
                  >
                    Pemindaian BLE Gagal
                  </Text>
                  <Text
                    style={[
                      styles.stateBody,
                      { color: palette.statusErrorText },
                    ]}
                  >
                    {scanError}
                  </Text>
                </View>
              )}

              {discoveredWatches.length > 0 && (
                <View style={styles.deviceList}>
                  <Text
                    style={[styles.fieldLabel, { color: palette.textPrimary }]}
                  >
                    Perangkat Ditemukan ({discoveredWatches.length})
                  </Text>
                  {discoveredWatches.map((watch) => (
                    <View
                      key={watch.id}
                      style={[
                        styles.deviceRow,
                        {
                          backgroundColor: palette.surfaceSecondary,
                          borderColor: watch.isVergeLiteCandidate
                            ? palette.borderStrong
                            : palette.border,
                        },
                      ]}
                    >
                      <View style={styles.deviceInfo}>
                        <Text
                          style={[
                            styles.deviceName,
                            { color: palette.textPrimary },
                          ]}
                        >
                          {watch.name}
                        </Text>
                        <Text
                          style={[
                            styles.deviceMeta,
                            { color: palette.textSecondary },
                          ]}
                        >
                          ID: {watch.id} | RSSI: {watch.rssi ?? 'N/A'} dBm
                        </Text>
                      </View>
                      <PressableControl
                        palette={palette}
                        accessibilityLabel={`Hubungkan ke ${watch.name}`}
                        onPress={() => onConnectWatch(watch.id, watch.name)}
                        style={[
                          styles.connectBtn,
                          {
                            backgroundColor: palette.accent,
                            borderColor: palette.borderStrong,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.connectBtnText,
                            { color: palette.accentText },
                          ]}
                        >
                          Hubungkan
                        </Text>
                      </PressableControl>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  statusGroup: {
    flex: 1,
    gap: 6,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  targetMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  expandedBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  wifiSection: {
    gap: 14,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  ipInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ipInputFlex: {
    flex: 1,
  },
  textInput: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  testBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionsGrid: {
    gap: 8,
    marginTop: 6,
  },
  quickActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stateBox: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  stateTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stateBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  bleSection: {
    gap: 12,
  },
  scanActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deviceList: {
    gap: 8,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  deviceInfo: {
    flex: 1,
    gap: 2,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
  },
  deviceMeta: {
    fontSize: 11,
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
