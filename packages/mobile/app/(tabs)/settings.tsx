import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '../../store/timerStore';
import Svg, { Circle, Path} from 'react-native-svg';

// Icons
function SunIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx="12" cy="12" r="5" />
      <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Svg>
  );
}

function MoonIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}

interface SettingRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  colors: typeof lightColors;
}

function SettingRow({ label, value, onChange, min = 1, max = 120, unit = 'min', colors }: SettingRowProps) {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.settingControl}>
        <Pressable
          style={[styles.stepButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleDecrement}
        >
          <Text style={[styles.stepButtonText, { color: colors.text }]}>−</Text>
        </Pressable>
        <View style={[styles.valueContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.valueText, { color: colors.text }]}>{value}</Text>
          {unit && <Text style={[styles.unitText, { color: colors.textMuted }]}>{unit}</Text>}
        </View>
        <Pressable
          style={[styles.stepButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleIncrement}
        >
          <Text style={[styles.stepButtonText, { color: colors.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const { config, setConfig } = useTimerStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Theme follows system</Text>
            <View style={styles.modeToggle}>
              <View style={[styles.modeButton, !isDark && styles.modeButtonActive, { borderColor: !isDark ? colors.primary : colors.border }]}>
                <SunIcon color={!isDark ? colors.primary : colors.textSecondary} />
                <Text style={[styles.modeButtonText, { color: !isDark ? colors.primary : colors.textSecondary }]}>Light</Text>
              </View>
              <View style={[styles.modeButton, isDark && styles.modeButtonActive, { borderColor: isDark ? colors.primary : colors.border }]}>
                <MoonIcon color={isDark ? colors.primary : colors.textSecondary} />
                <Text style={[styles.modeButtonText, { color: isDark ? colors.primary : colors.textSecondary }]}>Dark</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timer Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>TIMER</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow
              label="Focus Duration"
              value={config.workMins}
              onChange={(v) => setConfig({ workMins: v })}
              min={1}
              max={120}
              unit="min"
              colors={colors}
            />
            <SettingRow
              label="Short Break"
              value={config.breakMins}
              onChange={(v) => setConfig({ breakMins: v })}
              min={1}
              max={60}
              unit="min"
              colors={colors}
            />
            <SettingRow
              label="Long Break"
              value={config.longBreakMins}
              onChange={(v) => setConfig({ longBreakMins: v })}
              min={1}
              max={60}
              unit="min"
              colors={colors}
            />
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DAILY GOAL</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow
              label="Pomodoros per Day"
              value={config.dailyGoal}
              onChange={(v) => setConfig({ dailyGoal: v })}
              min={1}
              max={20}
              unit=""
              colors={colors}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>0.0.1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const lightColors = {
  background: '#fafafa',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  primary: '#16a34a',
};

const darkColors = {
  background: '#0f0f1a',
  card: '#1e1e2e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: '#374151',
  primary: '#22c55e',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: '400',
  },
  valueContainer: {
    minWidth: 70,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    fontSize: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  aboutLabel: {
    fontSize: 15,
  },
  aboutValue: {
    fontSize: 15,
  },
});
