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
import { ActiveTelemeterDeck } from './src/components/ActiveTelemeterDeck';
import { CommandLogPanel } from './src/components/CommandLogPanel';
import { ConnectionPanel } from './src/components/ConnectionPanel';
import { PressableControl } from './src/components/PressableControl';
import { WorkoutTriggerMatrix } from './src/components/WorkoutTriggerMatrix';
import {
  amazfitBle,
  buildScreenLockBytes,
  buildWorkoutCommandBytes,
  bytesToHex,
  WorkoutControlAction,
} from './src/services/amazfitBle';
import { PALETTES, ThemeMode } from './src/theme/palette';
import {
  ActiveSessionState,
  BleConnectionStatus,
  CommandLogEntry,
  ConnectionMode,
  DiscoveredWatch,
  WORKOUT_MODES,
  WorkoutId,
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

  // Three distinct layout states across the width continuum (R-03, antislop-layoutmobile)
  const isCompactPhone = width < 620;
  const isWideConsole = width >= 980;

  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const palette = PALETTES[themeMode];

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
  const [favoriteIds, setFavoriteIds] = useState<WorkoutId[]>([
    'outdoor_run',
    'trail_run',
    'walking',
    'outdoor_cycling',
  ]);
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

  useEffect(() => {
    return () => {
      amazfitBle.stopScan();
    };
  }, []);

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
  };

  const handleTestWifiConnection = async () => {
    setWifiStatus('connecting');
    setScanError(null);
    try {
      const res = await fetch(`http://${watchIp.trim()}:8080/ping`);
      const data = await res.json();
      if (data.status === 'ok') {
        setWifiStatus('connected');
        setConnectedWatchName(data.device || 'Amazfit Verge A1811');
        appendLog(
          'Uji Sambung Hotspot',
          [0x80, 0x80],
          'sent',
          `Terhubung ke ${data.device || 'Amazfit Verge'} (${watchIp.trim()}:8080).`
        );
      } else {
        throw new Error('Jam membalas dengan status tidak valid');
      }
    } catch (e) {
      setWifiStatus('error');
      const err = e instanceof Error ? e.message : 'Gagal menghubungi jam tangan';
      setScanError(`Koneksi ke ${watchIp.trim()}:8080 gagal: ${err}`);
      appendLog('Uji Sambung Hotspot', [0x80, 0x80], 'error', err);
    }
  };

  const handleOpenLauncher = async () => {
    try {
      await fetch(`http://${watchIp.trim()}:8080/launcher`, { method: 'POST' });
      appendLog('Buka Menu Olahraga', [0x06, 0x17], 'sent', 'Menu olahraga di jam tangan terbuka.');
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
      appendLog('Sentuh Tombol Mulai Jam', [0x01], 'sent', 'Perintah sentuh tombol tengah jam terkirim.');
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Gagal mengirim sentuhan ke jam';
      appendLog('Sentuh Tombol Mulai Jam', [0x01], 'error', err);
    }
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
        const res = await fetch(
          `http://${watchIp.trim()}:8080/start?type=${workout.id}&lock=${lockParam}`,
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
      `Hentikan & Simpan ${selectedWorkout.title}`
    );
    if (ok) {
      setSessionState('idle');
      setElapsedSeconds(0);
    }
  };

  const handleManualScreenLock = async () => {
    setIsSendingCommand(true);
    setLastCommandError(null);
    const lockBytes = buildScreenLockBytes(true);
    try {
      let lockTarget = 'Simulasi';
      if (connectionMode === 'ble') {
        lockTarget = await amazfitBle.sendRawBytes(
          lockBytes,
          connectedWatchId || manualMac.trim()
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      appendLog(
        'Kunci Ulang Layar Jam (Manual)',
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

  const handleToggleFavorite = (workoutId: WorkoutId) => {
    setFavoriteIds((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    );
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
              AMAZFIT VERGE TRIGGER
            </Text>
            <Text style={[styles.appSub, { color: palette.textSecondary }]}>
              Remote Olahraga Verge A1811 (Anti-Ghost-Touch)
            </Text>
          </View>

          <PressableControl
            palette={palette}
            accessibilityLabel={
              themeMode === 'dark'
                ? 'Ubah ke Tema Terang (Siang Hari Luar Ruang)'
                : 'Ubah ke Tema Gelap (Malam / AMOLED)'
            }
            onPress={() =>
              setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
            }
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: palette.surfaceSecondary,
                borderColor: palette.borderStrong,
              },
            ]}
          >
            <Text
              style={[styles.themeToggleText, { color: palette.textPrimary }]}
            >
              {themeMode === 'dark' ? 'Tema: Gelap' : 'Tema: Terang'}
            </Text>
          </PressableControl>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isCompactPhone ? styles.paddingCompact : styles.paddingRegular,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.mainLayout,
              isWideConsole ? styles.wideTwoColumn : styles.stackedColumn,
            ]}
          >
            <View
              style={[
                styles.leftColumn,
                isWideConsole && styles.wideLeftColumn,
              ]}
            >
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

              <ActiveTelemeterDeck
                palette={palette}
                selectedWorkout={selectedWorkout}
                sessionState={sessionState}
                elapsedSeconds={elapsedSeconds}
                autoScreenLock={autoScreenLock}
                isSendingCommand={isSendingCommand}
                onToggleAutoScreenLock={() =>
                  setAutoScreenLock((prev) => !prev)
                }
                onTriggerStart={handleTriggerStart}
                onTriggerPause={handleTriggerPause}
                onTriggerResume={handleTriggerResume}
                onTriggerStop={handleTriggerStop}
                onSendManualScreenLock={handleManualScreenLock}
              />

              {isWideConsole && (
                <CommandLogPanel
                  palette={palette}
                  logs={commandLogs}
                  isSendingCommand={isSendingCommand}
                  lastError={lastCommandError}
                  onClearLogs={() => setCommandLogs([])}
                  onClearError={() => setLastCommandError(null)}
                />
              )}
            </View>

            <View
              style={[
                styles.rightColumn,
                isWideConsole && styles.wideRightColumn,
              ]}
            >
              <WorkoutTriggerMatrix
                palette={palette}
                workouts={WORKOUT_MODES}
                selectedWorkoutId={selectedWorkout.id}
                favoriteIds={favoriteIds}
                isCompactViewport={isCompactPhone}
                isSendingCommand={isSendingCommand}
                onSelectWorkout={(workout) => {
                  setSelectedWorkout(workout);
                  setAutoScreenLock(workout.recommendedScreenLock);
                }}
                onQuickTriggerWorkout={handleTriggerStart}
                onToggleFavorite={handleToggleFavorite}
              />

              {!isWideConsole && (
                <CommandLogPanel
                  palette={palette}
                  logs={commandLogs}
                  isSendingCommand={isSendingCommand}
                  lastError={lastCommandError}
                  onClearLogs={() => setCommandLogs([])}
                  onClearError={() => setLastCommandError(null)}
                />
              )}
            </View>
          </View>
        </ScrollView>
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
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    gap: 10,
  },
  brandBlock: {
    flex: 1,
    minWidth: 190,
    gap: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  appSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeToggleBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 48,
  },
  paddingCompact: {
    padding: 12,
  },
  paddingRegular: {
    padding: 20,
  },
  mainLayout: {
    gap: 20,
  },
  stackedColumn: {
    flexDirection: 'column',
  },
  wideTwoColumn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftColumn: {
    gap: 16,
  },
  wideLeftColumn: {
    flex: 5,
    minWidth: 360,
  },
  rightColumn: {
    gap: 20,
  },
  wideRightColumn: {
    flex: 7,
    minWidth: 460,
  },
});
