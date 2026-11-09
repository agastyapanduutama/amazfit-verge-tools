import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorPalette } from '../theme/palette';
import { AppTab, APP_TABS } from '../types/navigation';
import { PressableControl } from './PressableControl';

interface TabBarProps {
  palette: ColorPalette;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

const TAB_ICONS: Record<AppTab, string> = {
  health: '⚡',
  sport: '👟',
  heart_rate: '❤️',
  history: '📋',
  alarm: '⏰',
  smartface: '⌚',
};

export function TabBar({ palette, activeTab, onSelectTab }: TabBarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {APP_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <PressableControl
              key={tab.id}
              palette={palette}
              accessibilityLabel={`Menu ${tab.label}: ${tab.description}`}
              onPress={() => onSelectTab(tab.id)}
              style={[
                styles.tabItem,
                {
                  backgroundColor: isActive
                    ? palette.surfaceSecondary
                    : 'transparent',
                },
              ]}
            >
              <Text style={styles.tabSymbol}>{TAB_ICONS[tab.id]}</Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? palette.accent : palette.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.shortLabel}
              </Text>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: palette.accent },
                  ]}
                />
              )}
            </PressableControl>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 6,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 6,
    minHeight: 48,
    position: 'relative',
    gap: 3,
  },
  tabSymbol: {
    fontSize: 16,
    lineHeight: 18,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: 2,
  },
});
