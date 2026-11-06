import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemePalette } from '../theme/palette';
import { WorkoutId, WorkoutMode } from '../types/workout';
import { PressableControl } from './PressableControl';

export type FilterTab = 'all' | 'outdoor' | 'indoor' | 'favorites';

interface WorkoutTriggerMatrixProps {
  palette: ThemePalette;
  workouts: WorkoutMode[];
  selectedWorkoutId: WorkoutId;
  favoriteIds: WorkoutId[];
  isCompactViewport: boolean;
  isSendingCommand: boolean;
  onSelectWorkout: (workout: WorkoutMode) => void;
  onQuickTriggerWorkout: (workout: WorkoutMode) => void;
  onToggleFavorite: (workoutId: WorkoutId) => void;
}

export function WorkoutTriggerMatrix({
  palette,
  workouts,
  selectedWorkoutId,
  favoriteIds,
  isCompactViewport,
  isSendingCommand,
  onSelectWorkout,
  onQuickTriggerWorkout,
  onToggleFavorite,
}: WorkoutTriggerMatrixProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredWorkouts = workouts.filter((w) => {
    if (activeTab === 'outdoor') return w.category === 'outdoor';
    if (activeTab === 'indoor') return w.category === 'indoor';
    if (activeTab === 'favorites') return favoriteIds.includes(w.id);
    return true;
  });

  const outdoorWorkouts = filteredWorkouts.filter(
    (w) => w.category === 'outdoor'
  );
  const indoorWorkouts = filteredWorkouts.filter(
    (w) => w.category === 'indoor'
  );

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: `Semua (${workouts.length})` },
    { id: 'outdoor', label: 'Outdoor GPS (4)' },
    { id: 'indoor', label: 'Indoor (4)' },
    { id: 'favorites', label: `Favorit (${favoriteIds.length})` },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Kanal Olahraga Amazfit Verge A1811
        </Text>
        <Text style={[styles.sectionSub, { color: palette.textSecondary }]}>
          Pilih kanal untuk memuat ke dek utama atau tekan Picu Cepat untuk
          langsung menyalakan olahraga di jam.
        </Text>
      </View>

      <View style={styles.filterRow}>
        {filterTabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <PressableControl
              key={tab.id}
              palette={palette}
              accessibilityLabel={`Filter daftar olahraga: ${tab.label}`}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isSelected
                    ? palette.borderStrong
                    : palette.surface,
                  borderColor: isSelected
                    ? palette.borderStrong
                    : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: isSelected
                      ? palette.background
                      : palette.textPrimary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </PressableControl>
          );
        })}
      </View>

      {filteredWorkouts.length === 0 && (
        <View
          style={[
            styles.emptyFilterBox,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
            Belum Ada Mode Olahraga Favorit
          </Text>
          <Text style={[styles.emptyDesc, { color: palette.textSecondary }]}>
            Anda belum menandai kanal olahraga sebagai favorit. Tekan tombol
            Simpan Favorit pada salah satu olahraga, atau kembali ke daftar
            Semua.
          </Text>
          <PressableControl
            palette={palette}
            accessibilityLabel="Tampilkan semua mode olahraga"
            onPress={() => setActiveTab('all')}
            style={[
              styles.resetFilterBtn,
              {
                backgroundColor: palette.surfaceSecondary,
                borderColor: palette.borderStrong,
              },
            ]}
          >
            <Text
              style={[styles.resetFilterText, { color: palette.textPrimary }]}
            >
              Tampilkan Semua Olahraga (8)
            </Text>
          </PressableControl>
        </View>
      )}

      {outdoorWorkouts.length > 0 && (
        <View style={styles.groupBlock}>
          <Text style={[styles.groupTitle, { color: palette.textPrimary }]}>
            KANAL UTAMA LUAR RUANG (GPS + KUNCI LAYAR OTOMATIS)
          </Text>
          <View
            style={[
              styles.outdoorGrid,
              isCompactViewport ? styles.singleCol : styles.twoCol,
            ]}
          >
            {outdoorWorkouts.map((workout) => {
              const isSelected = workout.id === selectedWorkoutId;
              const isFav = favoriteIds.includes(workout.id);
              return (
                <View
                  key={workout.id}
                  style={[
                    styles.outdoorCard,
                    !isCompactViewport && styles.halfWidthCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: isSelected
                        ? palette.accent
                        : palette.border,
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                >
                  <View style={styles.cardTopBar}>
                    <View
                      style={[
                        styles.codeBadge,
                        {
                          backgroundColor: isSelected
                            ? palette.accent
                            : palette.surfaceSecondary,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.codeBadgeText,
                          {
                            color: isSelected
                              ? palette.accentText
                              : palette.textPrimary,
                          },
                        ]}
                      >
                        {workout.channelCode} | GPS
                      </Text>
                    </View>

                    <PressableControl
                      palette={palette}
                      accessibilityLabel={
                        isFav
                          ? `Hapus ${workout.title} dari favorit`
                          : `Simpan ${workout.title} ke favorit`
                      }
                      onPress={() => onToggleFavorite(workout.id)}
                      style={[
                        styles.favBtn,
                        {
                          backgroundColor: palette.surfaceSecondary,
                          borderColor: isFav
                            ? palette.borderStrong
                            : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.favBtnText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {isFav ? '[FAVORIT]' : '+ Favorit'}
                      </Text>
                    </PressableControl>
                  </View>

                  <Text
                    style={[styles.cardTitle, { color: palette.textPrimary }]}
                  >
                    {workout.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardSubMeta,
                      { color: palette.textSecondary },
                    ]}
                  >
                    Label Jam: {workout.WatchLabel} | Hex:{' '}
                    {workout.hexPayloadPreview}
                  </Text>
                  <Text
                    style={[styles.cardDesc, { color: palette.textSecondary }]}
                  >
                    {workout.shortDescription}
                  </Text>

                  <View style={styles.cardActionsRow}>
                    <PressableControl
                      palette={palette}
                      accessibilityLabel={`Pilih ${workout.title} ke dek utama`}
                      onPress={() => onSelectWorkout(workout)}
                      style={[
                        styles.selectBtn,
                        {
                          backgroundColor: isSelected
                            ? palette.surfaceSecondary
                            : palette.surface,
                          borderColor: palette.borderStrong,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectBtnText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {isSelected ? 'Terpasang di Dek' : 'Pilih ke Dek'}
                      </Text>
                    </PressableControl>

                    <PressableControl
                      palette={palette}
                      disabled={isSendingCommand}
                      accessibilityLabel={`Picu cepat ${workout.title} langsung ke jam`}
                      onPress={() => onQuickTriggerWorkout(workout)}
                      style={[
                        styles.quickStartBtn,
                        {
                          backgroundColor: palette.accent,
                          borderColor: palette.borderStrong,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickStartBtnText,
                          { color: palette.accentText },
                        ]}
                      >
                        Picu Cepat
                      </Text>
                    </PressableControl>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {indoorWorkouts.length > 0 && (
        <View style={styles.groupBlock}>
          <Text style={[styles.groupTitle, { color: palette.textPrimary }]}>
            KANAL DALAM RUANG (SENSOR GERAK &amp; DETAK JANTUNG TANPA GPS)
          </Text>
          <View style={styles.indoorList}>
            {indoorWorkouts.map((workout) => {
              const isSelected = workout.id === selectedWorkoutId;
              const isFav = favoriteIds.includes(workout.id);
              return (
                <View
                  key={workout.id}
                  style={[
                    styles.indoorRow,
                    {
                      backgroundColor: palette.surface,
                      borderColor: isSelected
                        ? palette.accent
                        : palette.border,
                      borderWidth: isSelected ? 2 : 1.5,
                    },
                  ]}
                >
                  <View style={styles.indoorLeft}>
                    <View style={styles.indoorHeaderLine}>
                      <Text
                        style={[
                          styles.indoorCode,
                          { color: palette.textSecondary },
                        ]}
                      >
                        [{workout.channelCode}]
                      </Text>
                      <Text
                        style={[
                          styles.indoorTitle,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {workout.title}
                      </Text>
                      <Text
                        style={[
                          styles.indoorHex,
                          { color: palette.textSecondary },
                        ]}
                      >
                        ({workout.WatchLabel} | {workout.hexPayloadPreview})
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.indoorDesc,
                        { color: palette.textSecondary },
                      ]}
                    >
                      {workout.shortDescription}
                    </Text>
                  </View>

                  <View style={styles.indoorActions}>
                    <PressableControl
                      palette={palette}
                      accessibilityLabel={
                        isFav
                          ? `Hapus ${workout.title} dari favorit`
                          : `Simpan ${workout.title} ke favorit`
                      }
                      onPress={() => onToggleFavorite(workout.id)}
                      style={[
                        styles.indoorSmallBtn,
                        {
                          backgroundColor: palette.surfaceSecondary,
                          borderColor: isFav
                            ? palette.borderStrong
                            : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.indoorSmallBtnText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {isFav ? '[FAV]' : '+ Fav'}
                      </Text>
                    </PressableControl>

                    <PressableControl
                      palette={palette}
                      accessibilityLabel={`Pilih ${workout.title} ke dek utama`}
                      onPress={() => onSelectWorkout(workout)}
                      style={[
                        styles.indoorSmallBtn,
                        {
                          backgroundColor: palette.surfaceSecondary,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.indoorSmallBtnText,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {isSelected ? 'Aktif' : 'Pilih'}
                      </Text>
                    </PressableControl>

                    <PressableControl
                      palette={palette}
                      disabled={isSendingCommand}
                      accessibilityLabel={`Picu cepat ${workout.title} langsung ke jam`}
                      onPress={() => onQuickTriggerWorkout(workout)}
                      style={[
                        styles.indoorTriggerBtn,
                        {
                          backgroundColor: palette.accent,
                          borderColor: palette.borderStrong,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.indoorTriggerBtnText,
                          { color: palette.accentText },
                        ]}
                      >
                        Picu Cepat
                      </Text>
                    </PressableControl>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 13,
    lineHeight: 19,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTab: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyFilterBox: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  resetFilterBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  groupBlock: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outdoorGrid: {
    gap: 12,
  },
  singleCol: {
    flexDirection: 'column',
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  outdoorCard: {
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  halfWidthCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 260,
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  favBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  favBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  cardSubMeta: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  selectBtn: {
    flex: 1,
    minWidth: 115,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickStartBtn: {
    flex: 1,
    minWidth: 115,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickStartBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  indoorList: {
    gap: 10,
  },
  indoorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  indoorLeft: {
    flex: 1,
    minWidth: 210,
    gap: 4,
  },
  indoorHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  indoorCode: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  indoorTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  indoorHex: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  indoorDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  indoorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  indoorSmallBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  indoorSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  indoorTriggerBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  indoorTriggerBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
});

