import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { AlarmMenu } from './src/components/AlarmMenu';
import { ConnectionPanel } from './src/components/ConnectionPanel';
import { HealthMenu } from './src/components/HealthMenu';
import { HeartRateMenu } from './src/components/HeartRateMenu';
import { HistoryMenu } from './src/components/HistoryMenu';
import { PressableControl } from './src/components/PressableControl';
import { SmartfaceMenu } from './src/components/SmartfaceMenu';
import { SportMenu } from './src/components/SportMenu';
import { TabBar } from './src/components/TabBar';
import {
  amazfitBle,
  buildScreenLockBytes,
  buildWorkoutCommandBytes,
  bytesToHex,
  WorkoutControlAction,
} from './src/services/amazfitBle';
import { PALETTES, ThemeMode } from './src/theme/palette';
import { AppTab } from './src/types/navigation';
import {
  ActiveSessionState,
  BleConnectionStatus,
  CommandLogEntry,
  ConnectionMode,
  DiscoveredWatch,
  WORKOUT_MODES,
  WorkoutMode,
} from './src/types/workout';

function getCurrentTimeLabel(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export default function App() {
  const { width } = useWindowDimensions();
  const isCompactPhone = width < 620;

  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const palette = PALETTES[themeMode];

  const [activeTab, setActiveTab] = useState<AppTab>('sport');
  const [isConnectionExpanded, setIsConnectionExpanded] = useState<boolean>(false);

  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>('wifi_hotspot');
  const [watchIp, setWatchIp] = useState<string>('10.86.7.33');
  const [wifiStatus, setWifiStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('connected');
  const [isTouchLocked, setIsTouchLocked] = useState<boolean>(false);
  const [bleStatus, setBleStatus] =
    useState<BleConnectionStatus>('disconnected');
  const [connectedWatchName, setConnectedWatchName] = useState<string | null>(
    'Amazfit Verge A1811'
  );
  const [connectedWatchId, setConnectedWatchId] = useState<string | null>(null);
  const [discoveredWatches, setDiscoveredWatches] = useState<DiscoveredWatch[]>(
    []
  );
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualMac, setManualMac] = useState<string>('D8:80:3C:2A:E4:57');
  const [authKeyHex, setAuthKeyHex] = useState<string>('');

  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutMode>(
    WORKOUT_MODES[0]
  );
  const [sessionState, setSessionState] = useState<ActiveSessionState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [autoScreenLock, setAutoScreenLock] = useState<boolean>(true);
  const [isSendingCommand, setIsSendingCommand] = useState<boolean>(false);
  const [lastCommandError, setLastCommandError] = useState<string | null>(null);
  const [commandLogs, setCommandLogs] = useState<CommandLogEntry[]>([]);

  useEffect(() => {
    if (sessionState !== 'running') {
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionState]);

  // Uji koneksi ke jam tangan otomatis saat aplikasi dibuka
  useEffect(() => {
    handleTestWifiConnection();
  }, []);

  const isDeviceConnected =
    connectionMode === 'simulation' ||
    (connectionMode === 'wifi_hotspot' && wifiStatus === 'connected') ||
    (connectionMode === 'ble' && bleStatus === 'connected');

  const isDeviceConnecting =
    (connectionMode === 'wifi_hotspot' && wifiStatus === 'connecting') ||
    (connectionMode === 'ble' &&
      (bleStatus === 'scanning' || bleStatus === 'connecting'));

  const isDeviceError =
    (connectionMode === 'wifi_hotspot' && wifiStatus === 'error') ||
    (connectionMode === 'ble' && bleStatus === 'error');

  const deviceStatusLabel = isDeviceConnecting
    ? 'MENGHUBUNGKAN...'
    : isDeviceConnected
      ? 'TERHUBUNG'
      : isDeviceError
        ? 'TERPUTUS'
        : 'BELUM TERHUBUNG';

  const appendLog = (
    actionLabel: string,
    bytes: number[],
    status: 'sent' | 'error',
    detail: string
  ) => {
    const newEntry: CommandLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: getCurrentTimeLabel(),
      actionLabel,
      hexPayload: bytesToHex(bytes),
      transport: connectionMode,
      status,
      detail,
    };
    setCommandLogs((prev) => [newEntry, ...prev.slice(0, 29)]);
  };

  const handleStartScan = async () => {
    setScanError(null);
    setDiscoveredWatches([]);
    setBleStatus('scanning');

    try {
      await amazfitBle.scanForWatches(
        (watch) => {
          setDiscoveredWatches((prev) => {
            const exists = prev.some((item) => item.id === watch.id);
            if (exists) {
              return prev.map((item) => (item.id === watch.id ? watch : item));
            }
            return [...prev, watch];
          });
        },
        (errMessage) => {
          setBleStatus('error');
          setScanError(errMessage);
        }
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memulai pemindaian BLE.';
      setBleStatus('error');
      setScanError(msg);
    }
  };

  const handleStopScan = () => {
    amazfitBle.stopScan();
    setBleStatus(connectedWatchId ? 'connected' : 'disconnected');
  };

  const handleConnectWatch = async (watchId: string, watchName: string) => {
    setScanError(null);
    setBleStatus('connecting');
    try {
      const device = await amazfitBle.connectToWatch(watchId);
      const charSummary = amazfitBle.getDiscoveredCharacteristicsSummary();
      setConnectedWatchId(device.id);
      setConnectedWatchName(device.name || watchName);
      setBleStatus('connected');
      appendLog(
        `Terhubung ke ${device.name || watchName}`,
        [0x00, 0xfe, 0xe0],
        'sent',
        `Koneksi GATT terbuka (ID: ${device.id}). Karakteristik: ${charSummary}`
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal terhubung ke jam tangan via BLE.';
      setBleStatus('error');
      setScanError(msg);
    }
  };

  const handleDisconnectWatch = async () => {
    await amazfitBle.disconnectWatch();
    setConnectedWatchId(null);
    setConnectedWatchName(null);
    setBleStatus('disconnected');
    appendLog(
      'Koneksi Diputus',
      [0x00],
      'sent',
      'Koneksi GATT ke jam tangan berhasil ditutup.'
    );
  };

  const handleTestWifiConnection = async () => {
    const target = watchIp.trim();
    if (!target) {
      setWifiStatus('error');
      appendLog('Uji Sambung Hotspot', [0x00], 'error', 'Alamat IP jam tangan kosong.');
      return;
    }
    setWifiStatus('connecting');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`http://${target}:8080/ping`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.status === 'ok') {
        setWifiStatus('connected');
        appendLog(
          'Uji Sambung Hotspot',
          [0x20, 0x00],
          'sent',
          `Terhubung ke ${data.device} (${data.model}) di IP ${target}:8080.`
        );
      } else {
        setWifiStatus('error');
        appendLog('Uji Sambung Hotspot', [0x20], 'error', 'Respons server jam tidak valid.');
      }
    } catch (err) {
      setWifiStatus('error');
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal menghubungi jam di jaringan hotspot.';
      appendLog('Uji Sambung Hotspot', [0x20], 'error', msg);
    }
  };

  const handleOpenLauncher = async () => {
    try {
      await fetch(`http://${watchIp.trim()}:8080/launcher`, { method: 'POST' });
      appendLog('Buka Menu Olahraga', [0x06, 0x17], 'sent', 'Perintah membuka menu olahraga jam terkirim.');
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Gagal membuka menu olahraga';
      appendLog('Buka Menu Olahraga', [0x06, 0x17], 'error', err);
    }
  };

  const handleWakeScreen = async () => {
    try {
      await fetch(`http://${watchIp.trim()}:8080/wakeup`, { method: 'POST' });
      appendLog('Bangunkan Layar', [0x26], 'sent', 'Sinyal wake up terkirim ke jam tangan.');
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Gagal membangunkan layar';
      appendLog('Bangunkan Layar', [0x26], 'error', err);
    }
  };

  const handleToggleTouchLock = async () => {
    const nextLocked = !isTouchLocked;
    try {
      await fetch(
        `http://${watchIp.trim()}:8080/touch?action=${nextLocked ? 'disable' : 'enable'}`,
        { method: 'POST' }
      );
      setIsTouchLocked(nextLocked);
      appendLog(
        nextLocked ? 'Kunci Layar Sentuh (Anti Ghost-Touch)' : 'Buka Layar Sentuh',
        [0x06, nextLocked ? 0x01 : 0x00],
        'sent',
        nextLocked
          ? 'Layar sentuh jam dinonaktifkan (ghost touch dicegah).'
          : 'Layar sentuh jam diaktifkan kembali.'
      );
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Gagal mengubah status layar';
      appendLog('Ubah Kunci Layar', [0x06], 'error', err);
    }
  };

  const handleTapCenter = async () => {
    try {
      await fetch(`http://${watchIp.trim()}:8080/tap`, { method: 'POST' });
      appendLog(
        'Tekan Mulai / GO di Jam',
        [0x01, 0x02],
        'sent',
        'Perintah mulai sesi (GO) dikirim ke jam. Sesi rekaman olahraga aktif.'
      );
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Gagal mengirim sinyal GO ke jam';
      appendLog('Tekan Mulai / GO di Jam', [0x01], 'error', err);
    }
  };

  const handleStartHeartRateMeasurement = async () => {
    setIsSendingCommand(true);
    try {
      if (connectionMode === 'wifi_hotspot') {
        await fetch(`http://${watchIp.trim()}:8080/heartrate`, { method: 'POST' });
        appendLog(
          'Ukur Detak Jantung',
          [0x21, 0x01],
          'sent',
          `Sinyal aktivasi sensor optik PPG dikirim ke jam (${watchIp}:8080). Layar pengukuran dibuka.`
        );
      } else {
        appendLog(
          'Ukur Detak Jantung',
          [0x21, 0x01],
          'sent',
          'Pengukuran denyut nadi diaktifkan.'
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal mengirim perintah jantung';
      appendLog('Ukur Detak Jantung', [0x21], 'error', msg);
    } finally {
      setIsSendingCommand(false);
    }
  };

  const handleTestVibrate = async () => {
    try {
      await fetch(`http://${watchIp.trim()}:8080/wakeup`, { method: 'POST' });
      appendLog('Uji Getar Jam', [0x08, 0x01], 'sent', 'Pemicu getar jam tangan terkirim.');
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Gagal mengirim getaran ke jam';
      appendLog('Uji Getar Jam', [0x08], 'error', err);
    }
  };

  const handleApplyWatchface = (faceName: string) => {
    appendLog(
      'Terapkan Watchface',
      [0x10, 0x01],
      'sent',
      `Tema dial "${faceName}" dipilih untuk Amazfit Verge.`
    );
  };

  const dispatchCommandToWatch = async (
    workout: WorkoutMode,
    action: WorkoutControlAction,
    actionTitle: string
  ): Promise<boolean> => {
    setIsSendingCommand(true);
    setLastCommandError(null);
    const cmdBytes = buildWorkoutCommandBytes(workout, action);

    try {
      let targetCharLabel = 'Simulasi';
      if (connectionMode === 'wifi_hotspot') {
        targetCharLabel = `Hotspot (${watchIp}:8080)`;
        const lockParam = autoScreenLock ? 1 : 0;
        const directParam = workout.requiresGps ? 0 : 1;
        const res = await fetch(
          `http://${watchIp.trim()}:8080/start?type=${workout.id}&lock=${lockParam}&direct=${directParam}`,
          { method: 'POST' }
        );
        const data = await res.json();
        if (data.status !== 'started') {
          throw new Error(data.error || 'Jam tangan tidak merespons mulai');
        }
        if (autoScreenLock) {
          setIsTouchLocked(true);
        }
      } else if (connectionMode === 'ble') {
        targetCharLabel = await amazfitBle.sendRawBytes(
          cmdBytes,
          connectedWatchId || manualMac.trim()
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 140));
      }

      appendLog(
        actionTitle,
        cmdBytes,
        'sent',
        connectionMode === 'wifi_hotspot'
          ? `Terkirim ke Amazfit Verge A1811 via ${targetCharLabel}. Olahraga ${workout.WatchLabel} dimulai.`
          : connectionMode === 'ble'
            ? `Terkirim ke Amazfit Verge A1811 (${workout.WatchLabel}) via ${targetCharLabel}.`
            : `Disimulasikan untuk kanal ${workout.channelCode} (${workout.WatchLabel}).`
      );

      if (action === 'start' && autoScreenLock) {
        appendLog(
          'Kunci Layar Anti-Ghost-Touch',
          [0x06, 0x01],
          'sent',
          'Layar sentuh jam dikunci agar ghost touch tidak mengganggu rekaman.'
        );
      }

      setIsSendingCommand(false);
      return true;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal mengirim sinyal ke jam tangan.';
      setLastCommandError(msg);
      appendLog(actionTitle, cmdBytes, 'error', msg);
      setIsSendingCommand(false);
      return false;
    }
  };

  const handleTriggerStart = async (workout: WorkoutMode) => {
    setSelectedWorkout(workout);
    const ok = await dispatchCommandToWatch(
      workout,
      'start',
      `Mulai ${workout.title} (${workout.channelCode})`
    );
    if (ok) {
      setElapsedSeconds(0);
      setSessionState('running');
    }
  };

  const handleTriggerPause = async () => {
    const ok = await dispatchCommandToWatch(
      selectedWorkout,
      'pause',
      `Jeda ${selectedWorkout.title}`
    );
    if (ok) {
      setSessionState('paused');
    }
  };

  const handleTriggerResume = async () => {
    const ok = await dispatchCommandToWatch(
      selectedWorkout,
      'resume',
      `Lanjutkan ${selectedWorkout.title}`
    );
    if (ok) {
      setSessionState('running');
    }
  };

  const handleTriggerStop = async () => {
    const ok = await dispatchCommandToWatch(
      selectedWorkout,
      'stop',
      `Selesai ${selectedWorkout.title}`
    );
    if (ok) {
      setSessionState('idle');
    }
  };

  const handleManualScreenLock = async () => {
    setIsSendingCommand(true);
    setLastCommandError(null);
    const lockBytes = buildScreenLockBytes(true);

    try {
      let lockTarget = 'Simulasi';
      if (connectionMode === 'wifi_hotspot') {
        lockTarget = `Hotspot (${watchIp}:8080)`;
        await fetch(`http://${watchIp.trim()}:8080/touch?action=disable`, {
          method: 'POST',
        });
        setIsTouchLocked(true);
      } else if (connectionMode === 'ble') {
        lockTarget = await amazfitBle.sendRawBytes(
          lockBytes,
          connectedWatchId || manualMac.trim()
        );
      }

      appendLog(
        'Kunci Layar Jam (Anti-Ghost-Touch)',
        lockBytes,
        'sent',
        `Sinyal pengunci layar terkirim via ${lockTarget}.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal mengirim kunci layar.';
      setLastCommandError(msg);
      appendLog('Kunci Ulang Layar Jam', lockBytes, 'error', msg);
    } finally {
      setIsSendingCommand(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeRoot, { backgroundColor: palette.background }]}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Bar */}
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: palette.surface,
              borderBottomColor: palette.border,
            },
          ]}
        >
          <View style={styles.brandBlock}>
            <Text style={[styles.appName, { color: palette.textPrimary }]}>
              AMAZFIT VERGE A1811
            </Text>
            <Text style={[styles.appSub, { color: palette.textSecondary }]}>
              Pusat Kendali Jam Tangan (Anti Ghost-Touch)
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Quick Connection Chip / Toggle */}
            <PressableControl
              palette={palette}
              accessibilityLabel="Pengaturan koneksi jam tangan"
              onPress={() => setIsConnectionExpanded((prev) => !prev)}
              style={[
                styles.connPill,
                {
                  backgroundColor: isDeviceConnected
                    ? palette.statusOkBg
                    : isDeviceError
                      ? palette.statusErrorBg
                      : palette.surfaceSecondary,
                  borderColor: isDeviceConnected
                    ? palette.statusOkText
                    : isDeviceError
                      ? palette.statusErrorText
                      : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.connPillText,
                  {
                    color: isDeviceConnected
                      ? palette.statusOkText
                      : isDeviceError
                        ? palette.statusErrorText
                        : palette.textPrimary,
                  },
                ]}
              >
                {isDeviceConnected
                  ? `● Terhubung (${watchIp})`
                  : isDeviceConnecting
                    ? '● Menguji...'
                    : '○ Belum Terhubung'}
              </Text>
            </PressableControl>

            {/* Theme Toggle */}
            <PressableControl
              palette={palette}
              accessibilityLabel="Ganti tema warna"
              onPress={() =>
                setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
              }
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text style={[styles.themeToggleText, { color: palette.textPrimary }]}>
                {themeMode === 'dark' ? 'Gelap' : 'Terang'}
              </Text>
            </PressableControl>
          </View>
        </View>

        {/* Main Content Area */}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isCompactPhone ? styles.paddingCompact : styles.paddingRegular,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {/* Status Perangkat Utama: Selalu Terlihat di Semua Menu */}
            <View
              style={[
                styles.deviceStatusCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: isDeviceConnected
                    ? palette.statusOkText
                    : isDeviceError
                      ? palette.statusErrorText
                      : palette.border,
                },
              ]}
            >
              <View style={styles.deviceStatusHeader}>
                <View style={styles.deviceIdentityBlock}>
                  <View style={styles.deviceBadgeRow}>
                    <View
                      style={[
                        styles.deviceStatusDot,
                        {
                          backgroundColor: isDeviceConnected
                            ? '#10B981'
                            : isDeviceError
                              ? '#EF4444'
                              : isDeviceConnecting
                                ? '#F59E0B'
                                : '#64748B',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.deviceTitle,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {connectedWatchName || 'Amazfit Verge A1811'}
                    </Text>
                    <View
                      style={[
                        styles.connectionBadge,
                        {
                          backgroundColor: isDeviceConnected
                            ? palette.statusOkBg
                            : isDeviceError
                              ? palette.statusErrorBg
                              : palette.surfaceSecondary,
                          borderColor: isDeviceConnected
                            ? palette.statusOkText
                            : isDeviceError
                              ? palette.statusErrorText
                              : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.connectionBadgeText,
                          {
                            color: isDeviceConnected
                              ? palette.statusOkText
                              : isDeviceError
                                ? palette.statusErrorText
                                : palette.textSecondary,
                          },
                        ]}
                      >
                        {deviceStatusLabel}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.deviceDetailText,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {connectionMode === 'wifi_hotspot'
                      ? `Target: http://${watchIp}:8080 (Hotspot Jam) • Status: ${
                          wifiStatus === 'connected'
                            ? 'Aktif Siap Kirim'
                            : wifiStatus === 'connecting'
                              ? 'Menguji respons jam...'
                              : wifiStatus === 'error'
                                ? 'Hotspot jam tidak ditemukan'
                                : 'Belum diuji'
                        }`
                      : connectionMode === 'ble'
                        ? `Target: BLE ${manualMac} • GATT Service`
                        : 'Mode: Simulasi Lokal'}
                  </Text>
                </View>

                {/* Tombol Aksi Cepat Koneksi */}
                <View style={styles.deviceCardActions}>
                  <PressableControl
                    palette={palette}
                    accessibilityLabel="Uji sambungan ke jam tangan"
                    onPress={
                      connectionMode === 'wifi_hotspot'
                        ? handleTestWifiConnection
                        : handleStartScan
                    }
                    style={[
                      styles.deviceActionBtn,
                      {
                        backgroundColor: palette.surfaceSecondary,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.deviceActionBtnText,
                        { color: palette.accent },
                      ]}
                    >
                      {isDeviceConnecting ? 'Menguji...' : 'Uji Sambungan'}
                    </Text>
                  </PressableControl>

                  <PressableControl
                    palette={palette}
                    accessibilityLabel={
                      isConnectionExpanded
                        ? 'Tutup pengaturan koneksi'
                        : 'Buka pengaturan koneksi jam'
                    }
                    onPress={() => setIsConnectionExpanded((prev) => !prev)}
                    style={[
                      styles.deviceActionBtn,
                      {
                        backgroundColor: isConnectionExpanded
                          ? palette.accent
                          : palette.surfaceSecondary,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.deviceActionBtnText,
                        {
                          color: isConnectionExpanded
                            ? palette.accentText
                            : palette.textPrimary,
                        },
                      ]}
                    >
                      {isConnectionExpanded ? 'Tutup Pengaturan' : 'Atur IP / Mode'}
                    </Text>
                  </PressableControl>
                </View>
              </View>
            </View>

            {/* Collapsible Connection Panel */}
            {isConnectionExpanded && (
              <View style={styles.panelSection}>
                <ConnectionPanel
                  palette={palette}
                  connectionMode={connectionMode}
                  bleStatus={bleStatus}
                  wifiStatus={wifiStatus}
                  connectedWatchName={connectedWatchName}
                  connectedWatchId={connectedWatchId}
                  discoveredWatches={discoveredWatches}
                  scanError={scanError}
                  manualMac={manualMac}
                  authKeyHex={authKeyHex}
                  watchIp={watchIp}
                  isTouchLocked={isTouchLocked}
                  onChangeWatchIp={setWatchIp}
                  onChangeManualMac={setManualMac}
                  onChangeAuthKeyHex={setAuthKeyHex}
                  onSwitchConnectionMode={(mode) => {
                    setConnectionMode(mode);
                    setScanError(null);
                    setLastCommandError(null);
                  }}
                  onStartScan={handleStartScan}
                  onStopScan={handleStopScan}
                  onConnectWatch={handleConnectWatch}
                  onDisconnectWatch={handleDisconnectWatch}
                  onTestWifiConnection={handleTestWifiConnection}
                  onOpenLauncher={handleOpenLauncher}
                  onWakeScreen={handleWakeScreen}
                  onToggleTouchLock={handleToggleTouchLock}
                  onTapCenter={handleTapCenter}
                />
              </View>
            )}

            {/* 6 Tabs Switcher */}
            {activeTab === 'health' && (
              <HealthMenu
                palette={palette}
                onSyncWithWatch={handleWakeScreen}
              />
            )}

            {activeTab === 'sport' && (
              <SportMenu
                palette={palette}
                selectedWorkout={selectedWorkout}
                sessionState={sessionState}
                elapsedSeconds={elapsedSeconds}
                autoScreenLock={autoScreenLock}
                isSendingCommand={isSendingCommand}
                isTouchLocked={isTouchLocked}
                onSelectWorkout={(workout) => {
                  setSelectedWorkout(workout);
                  setAutoScreenLock(workout.recommendedScreenLock);
                }}
                onToggleAutoScreenLock={() => setAutoScreenLock((prev) => !prev)}
                onTriggerStart={handleTriggerStart}
                onTriggerPause={handleTriggerPause}
                onTriggerResume={handleTriggerResume}
                onTriggerStop={handleTriggerStop}
                onSendManualScreenLock={handleManualScreenLock}
                onTapCenter={handleTapCenter}
                onOpenLauncher={handleOpenLauncher}
                onWakeScreen={handleWakeScreen}
                onToggleTouchLock={handleToggleTouchLock}
              />
            )}

            {activeTab === 'heart_rate' && (
              <HeartRateMenu
                palette={palette}
                watchIp={watchIp}
                onTriggerMeasure={handleStartHeartRateMeasurement}
              />
            )}

            {activeTab === 'history' && (
              <HistoryMenu
                palette={palette}
                logs={commandLogs}
                onClearLogs={() => setCommandLogs([])}
              />
            )}

            {activeTab === 'alarm' && (
              <AlarmMenu
                palette={palette}
                onTestVibrate={handleTestVibrate}
              />
            )}

            {activeTab === 'smartface' && (
              <SmartfaceMenu
                palette={palette}
                watchIp={watchIp}
                onApplyWatchface={handleApplyWatchface}
              />
            )}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <TabBar
          palette={palette}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  brandBlock: {
    flex: 1,
    minWidth: 160,
    gap: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  appSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 36,
    justifyContent: 'center',
  },
  connPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themeToggleBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  paddingCompact: {
    padding: 14,
  },
  paddingRegular: {
    padding: 20,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 680,
    gap: 16,
  },
  panelSection: {
    marginBottom: 4,
  },
  deviceStatusCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    gap: 10,
  },
  deviceStatusHeader: {
    gap: 10,
  },
  deviceIdentityBlock: {
    gap: 4,
  },
  deviceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deviceStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  connectionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  connectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deviceDetailText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  deviceCardActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  deviceActionBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
