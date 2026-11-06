import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemePalette } from '../theme/palette';
import { ActiveSessionState, WorkoutMode } from '../types/workout';
import { PressableControl } from './PressableControl';

interface ActiveTelemeterDeckProps {
  palette: ThemePalette;
  selectedWorkout: WorkoutMode;
  sessionState: ActiveSessionState;
  elapsedSeconds: number;
  autoScreenLock: boolean;
  isSendingCommand: boolean;
  onToggleAutoScreenLock: () => void;
  onTriggerStart: (workout: WorkoutMode) => void;
  onTriggerPause: () => void;
  onTriggerResume: () => void;
  onTriggerStop: () => void;
  onSendManualScreenLock: () => void;
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export function ActiveTelemeterDeck({
  palette,
  selectedWorkout,
  sessionState,
  elapsedSeconds,
  autoScreenLock,
  isSendingCommand,
  onToggleAutoScreenLock,
  onTriggerStart,
  onTriggerPause,
  onTriggerResume,
  onTriggerStop,
  onSendManualScreenLock,
}: ActiveTelemeterDeckProps) {
  const isActive = sessionState !== 'idle';

  return (
    <View
      style={[
        styles.deck,
        {
          backgroundColor: palette.surface,
          borderColor: isActive ? palette.accent : palette.borderStrong,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.channelBadgeRow}>
          <View
            style={[
              styles.channelTag,
              {
                backgroundColor: palette.surfaceSecondary,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.channelText, { color: palette.textPrimary }]}>
              {selectedWorkout.channelCode}
            </Text>
          </View>
          <View
            style={[
              styles.channelTag,
              {
                backgroundColor: palette.surfaceSecondary,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.channelText, { color: palette.textPrimary }]}>
              {selectedWorkout.requiresGps ? 'GPS LUAR RUANG' : 'SENSOR INDOOR'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statePill,
            {
              backgroundColor:
                sessionState === 'running'
                  ? palette.statusOkBg
                  : sessionState === 'paused'
                    ? palette.surfaceSecondary
                    : palette.surfaceSecondary,
              borderColor: palette.border,
            },
          ]}
        >
          <Text
            style={[
              styles.statePillText,
              {
                color:
                  sessionState === 'running'
                    ? palette.statusOkText
                    : palette.textPrimary,
              },
            ]}
          >
            {sessionState === 'running'
              ? 'STATUS: MEREKAM DI JAM'
              : sessionState === 'paused'
                ? 'STATUS: DIJEDA'
                : 'STATUS: SIAP PICU'}
          </Text>
        </View>
      </View>

      <View style={styles.mainInfoBlock}>
        <Text style={[styles.workoutTitle, { color: palette.textPrimary }]}>
          {selectedWorkout.title}
        </Text>
        <Text style={[styles.watchSubtitle, { color: palette.textSecondary }]}>
          Mode Jam: {selectedWorkout.WatchLabel} | Paket GATT:{' '}
          {selectedWorkout.hexPayloadPreview}
        </Text>
        <Text style={[styles.descriptionText, { color: palette.textSecondary }]}>
          {selectedWorkout.shortDescription}
        </Text>
      </View>

      {isActive && (
        <View
          style={[
            styles.timerBox,
            {
              backgroundColor: palette.surfaceSecondary,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.timerLabel, { color: palette.textSecondary }]}>
            DURASI SESI AKTIF
          </Text>
          <Text style={[styles.timerDigits, { color: palette.textPrimary }]}>
            {formatDuration(elapsedSeconds)}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.ghostTouchRow,
          {
            backgroundColor: palette.surfaceSecondary,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.ghostTouchTextCol}>
          <Text style={[styles.ghostTouchTitle, { color: palette.textPrimary }]}>
            Proteksi Ghost-Touch Layar Jam: {autoScreenLock ? 'AKTIF' : 'MATI'}
          </Text>
          <Text
            style={[styles.ghostTouchSub, { color: palette.textSecondary }]}
          >
            Mengirim sinyal kunci tombol layar (06 05 00 01) setelah olahraga
            dimulai agar sentuhan liar tidak menghentikan rekaman.
          </Text>
        </View>

        <PressableControl
          palette={palette}
          accessibilityLabel={
            autoScreenLock
              ? 'Matikan kunci layar otomatis anti ghost-touch'
              : 'Aktifkan kunci layar otomatis anti ghost-touch'
          }
          onPress={onToggleAutoScreenLock}
          style={[
            styles.lockToggleBtn,
            {
              backgroundColor: autoScreenLock
                ? palette.statusOkBg
                : palette.surface,
              borderColor: palette.borderStrong,
            },
          ]}
        >
          <Text
            style={[
              styles.lockToggleBtnText,
              {
                color: autoScreenLock
                  ? palette.statusOkText
                  : palette.textPrimary,
              },
            ]}
          >
            {autoScreenLock ? 'Kunci: ON' : 'Kunci: OFF'}
          </Text>
        </PressableControl>
      </View>

      {sessionState === 'idle' ? (
        <PressableControl
          palette={palette}
          disabled={isSendingCommand}
          accessibilityLabel={`Mulai ${selectedWorkout.title} di Jam Amazfit Verge A1811`}
          onPress={() => onTriggerStart(selectedWorkout)}
          style={[
            styles.primaryTriggerBtn,
            {
              backgroundColor: palette.accent,
              borderColor: palette.borderStrong,
            },
          ]}
        >
          <Text
            style={[
              styles.primaryTriggerText,
              { color: palette.accentText },
            ]}
          >
            {isSendingCommand
              ? 'Mengirim Sinyal Trigger ke Jam...'
              : `Mulai ${selectedWorkout.title} di Jam`}
          </Text>
        </PressableControl>
      ) : (
        <View style={styles.activeControlsGroup}>
          <View style={styles.secondaryControlsRow}>
            {sessionState === 'running' ? (
              <PressableControl
                palette={palette}
                disabled={isSendingCommand}
                accessibilityLabel={`Jeda sesi ${selectedWorkout.title}`}
                onPress={onTriggerPause}
                style={[
                  styles.sessionActionBtn,
                  {
                    backgroundColor: palette.surfaceSecondary,
                    borderColor: palette.borderStrong,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sessionActionText,
                    { color: palette.textPrimary },
                  ]}
                >
                  Jeda Sesi (Pause)
                </Text>
              </PressableControl>
            ) : (
              <PressableControl
                palette={palette}
                disabled={isSendingCommand}
                accessibilityLabel={`Lanjutkan sesi ${selectedWorkout.title}`}
                onPress={onTriggerResume}
                style={[
                  styles.sessionActionBtn,
                  {
                    backgroundColor: palette.accent,
                    borderColor: palette.borderStrong,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sessionActionText,
                    { color: palette.accentText },
                  ]}
                >
                  Lanjutkan Sesi (Resume)
                </Text>
              </PressableControl>
            )}

            <PressableControl
              palette={palette}
              disabled={isSendingCommand}
              accessibilityLabel="Kirim ulang sinyal kunci layar anti ghost-touch ke jam"
              onPress={onSendManualScreenLock}
              style={[
                styles.sessionActionBtn,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.sessionActionText,
                  { color: palette.textPrimary },
                ]}
              >
                Kunci Ulang Layar Jam
              </Text>
            </PressableControl>
          </View>

          <PressableControl
            palette={palette}
            disabled={isSendingCommand}
            accessibilityLabel={`Hentikan ${selectedWorkout.title} dan simpan ke aplikasi Zepp`}
            onPress={onTriggerStop}
            style={[
              styles.stopSessionBtn,
              {
                backgroundColor: palette.statusErrorBg,
                borderColor: palette.borderStrong,
              },
            ]}
          >
            <Text
              style={[
                styles.stopSessionText,
                { color: palette.statusErrorText },
              ]}
            >
              Hentikan Olahraga &amp; Simpan ke Zepp
            </Text>
          </PressableControl>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  channelText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statePill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mainInfoBlock: {
    gap: 4,
  },
  workoutTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  watchSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  timerBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 2,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  timerDigits: {
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  ghostTouchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  ghostTouchTextCol: {
    flex: 1,
    minWidth: 190,
    gap: 2,
  },
  ghostTouchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  ghostTouchSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  lockToggleBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lockToggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryTriggerBtn: {
    minHeight: 60,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTriggerText: {
    fontSize: 17,
    fontWeight: '800',
  },
  activeControlsGroup: {
    gap: 10,
  },
  secondaryControlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sessionActionBtn: {
    flex: 1,
    minWidth: 150,
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sessionActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stopSessionBtn: {
    minHeight: 56,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stopSessionText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

