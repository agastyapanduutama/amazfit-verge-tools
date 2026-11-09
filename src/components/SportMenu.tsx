import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import {
  ActiveSessionState,
  WorkoutId,
  WorkoutMode,
  WORKOUT_MODES,
} from '../types/workout';
import { ActiveTelemeterDeck } from './ActiveTelemeterDeck';
import { PressableControl } from './PressableControl';

interface SportMenuProps {
  palette: ColorPalette;
  selectedWorkout: WorkoutMode;
  sessionState: ActiveSessionState;
  elapsedSeconds: number;
  autoScreenLock: boolean;
  isSendingCommand: boolean;
  isTouchLocked: boolean;
  onSelectWorkout: (workout: WorkoutMode) => void;
  onToggleAutoScreenLock: () => void;
  onTriggerStart: (workout: WorkoutMode) => void;
  onTriggerPause: () => void;
  onTriggerResume: () => void;
  onTriggerStop: () => void;
  onSendManualScreenLock: () => void;
  onTapCenter?: () => void;
  onOpenLauncher?: () => void;
  onWakeScreen?: () => void;
  onToggleTouchLock?: () => void;
}

export function SportMenu({
  palette,
  selectedWorkout,
  sessionState,
  elapsedSeconds,
  autoScreenLock,
  isSendingCommand,
  isTouchLocked,
  onSelectWorkout,
  onToggleAutoScreenLock,
  onTriggerStart,
  onTriggerPause,
  onTriggerResume,
  onTriggerStop,
  onSendManualScreenLock,
  onTapCenter,
  onOpenLauncher,
  onWakeScreen,
  onToggleTouchLock,
}: SportMenuProps) {
  return (
    <View style={styles.container}>
      {/* Active Workout Telemeter */}
      <ActiveTelemeterDeck
        palette={palette}
        selectedWorkout={selectedWorkout}
        sessionState={sessionState}
        elapsedSeconds={elapsedSeconds}
        autoScreenLock={autoScreenLock}
        isSendingCommand={isSendingCommand}
        onToggleAutoScreenLock={onToggleAutoScreenLock}
        onTriggerStart={onTriggerStart}
        onTriggerPause={onTriggerPause}
        onTriggerResume={onTriggerResume}
        onTriggerStop={onTriggerStop}
        onSendManualScreenLock={onSendManualScreenLock}
      />

      {/* Ghost-Touch Protection Card */}
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
          Perlindungan Anti Ghost-Touch
        </Text>
        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
          Matikan sensor sentuh jam saat berolahraga agar sentuhan liar tidak
          menghentikan atau membatalkan sesi rekaman Anda.
        </Text>

        <View style={styles.actionRow}>
          <PressableControl
            palette={palette}
            accessibilityLabel="Kunci atau buka layar sentuh jam"
            onPress={onToggleTouchLock || onSendManualScreenLock}
            style={[
              styles.actionButton,
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
                styles.actionButtonText,
                {
                  color: isTouchLocked
                    ? palette.statusOkText
                    : palette.textPrimary,
                },
              ]}
            >
              {isTouchLocked
                ? 'Layar Sentuh Terkunci (Aman)'
                : 'Kunci Layar Sentuh Jam'}
            </Text>
          </PressableControl>

          {onTapCenter && (
            <PressableControl
              palette={palette}
              accessibilityLabel="Tekan tombol Mulai atau GO di layar jam tangan"
              onPress={onTapCenter}
              style={[
                styles.actionButton,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: palette.accent, fontWeight: '800' },
                ]}
              >
                Tekan Mulai / GO di Jam
              </Text>
            </PressableControl>
          )}
        </View>
      </View>

      {/* Workout Mode Picker Card */}
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
          Pilih Jenis Olahraga
        </Text>
        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>
          Pilih mode olahraga untuk dikirim langsung ke sistem Huami OS Verge
        </Text>

        <View style={styles.workoutList}>
          {WORKOUT_MODES.map((mode) => {
            const isSelected = selectedWorkout.id === mode.id;
            return (
              <PressableControl
                key={mode.id}
                palette={palette}
                accessibilityLabel={`Pilih mode olahraga ${mode.title}`}
                onPress={() => onSelectWorkout(mode)}
                style={[
                  styles.workoutItem,
                  {
                    backgroundColor: isSelected
                      ? palette.surfaceSecondary
                      : palette.surface,
                    borderColor: isSelected ? palette.accent : palette.border,
                  },
                ]}
              >
                <View style={styles.workoutItemInfo}>
                  <Text
                    style={[
                      styles.workoutTitle,
                      {
                        color: isSelected ? palette.accent : palette.textPrimary,
                      },
                    ]}
                  >
                    {mode.title}
                  </Text>
                  <Text
                    style={[
                      styles.workoutDetail,
                      { color: palette.textSecondary },
                    ]}
                  >
                    Kanal {mode.channelCode} • Sensor: {mode.requiresGps ? 'GPS + Jantung' : 'Jantung + Langkah'}
                  </Text>
                </View>

                {isSelected && (
                  <View
                    style={[
                      styles.activeTag,
                      { backgroundColor: palette.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeTagText,
                        { color: palette.accentText },
                      ]}
                    >
                      Aktif
                    </Text>
                  </View>
                )}
              </PressableControl>
            );
          })}
        </View>
      </View>

      {/* Verge Direct System Controls */}
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
          Kendali Cepat Jam Tangan
        </Text>
        <View style={styles.actionRow}>
          {onOpenLauncher && (
            <PressableControl
              palette={palette}
              accessibilityLabel="Buka menu olahraga pada jam tangan"
              onPress={onOpenLauncher}
              style={[
                styles.actionButton,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: palette.textPrimary },
                ]}
              >
                Buka Menu Olahraga Jam
              </Text>
            </PressableControl>
          )}

          {onWakeScreen && (
            <PressableControl
              palette={palette}
              accessibilityLabel="Bangunkan layar jam tangan"
              onPress={onWakeScreen}
              style={[
                styles.actionButton,
                {
                  backgroundColor: palette.surfaceSecondary,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: palette.textPrimary },
                ]}
              >
                Bangunkan Layar Jam
              </Text>
            </PressableControl>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  workoutList: {
    gap: 8,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
  },
  workoutItemInfo: {
    gap: 4,
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  workoutDetail: {
    fontSize: 11,
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
