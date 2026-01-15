import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
} from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTimerStore, timerStore } from '../../store/timerStore';
import { PillTimer } from '../../components/PillTimer';
import { DailyProgress } from '../../components/DailyProgress';

export default function TimerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Use the global store with proper reactivity
  const { session, remainingSeconds, config, start, pause, resume, cancel, reset, tick } = useTimerStore();
  const [taskName, setTaskName] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  // Tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    start(taskName ? { taskName } : undefined);
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pause();
  };

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resume();
  };

  const handleCancel = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    cancel();
    reset();
    setTaskName('');
  };

  const handleComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompletedSessions((prev) => prev + 1);
    reset();
    setTaskName('');
  };

  const status = session?.status ?? 'idle';
  const totalSeconds = config.workMins * 60;
  const displayTime = status === 'idle' ? totalSeconds : remainingSeconds;

  // Haptic feedback when timer completes
  useEffect(() => {
    if (status === 'completed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.primary }]}>Pinepomo</Text>
      </View>

      {/* Main content */}
      <View style={styles.main}>
        {/* Task name input - only show when idle */}
        {status === 'idle' && (
          <TextInput
            style={[
              styles.taskInput,
              {
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="What are you working on?"
            placeholderTextColor={colors.placeholder}
            value={taskName}
            onChangeText={setTaskName}
            returnKeyType="done"
          />
        )}

        {/* Pill Timer */}
        <PillTimer
          remainingSeconds={displayTime}
          totalSeconds={totalSeconds}
          status={status}
          taskName={status !== 'idle' ? session?.taskName : undefined}
        />

        {/* Daily Progress */}
        <View style={styles.progressContainer}>
          <DailyProgress completed={completedSessions} goal={config.dailyGoal} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {status === 'idle' && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                { backgroundColor: colors.primary },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleStart}
            >
              <Text style={styles.buttonText}>Start Focus</Text>
            </Pressable>
          )}

          {status === 'running' && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonSecondary,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.buttonPressed,
              ]}
              onPress={handlePause}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Pause</Text>
            </Pressable>
          )}

          {status === 'paused' && (
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonPrimary,
                  { backgroundColor: colors.accent },
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleResume}
              >
                <Text style={styles.buttonText}>Resume</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonGhost,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: colors.danger }]}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {status === 'completed' && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                { backgroundColor: colors.success },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Complete</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const lightColors = {
  background: '#fafafa',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  placeholder: '#9ca3af',
  inputBackground: '#ffffff',
  border: '#e5e7eb',
  primary: '#16a34a',
  accent: '#d97706',
  success: '#059669',
  danger: '#dc2626',
};

const darkColors = {
  background: '#0f0f1a',
  card: '#1e1e2e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  placeholder: '#6b7280',
  inputBackground: '#1e1e2e',
  border: '#374151',
  primary: '#22c55e',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
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
  logo: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 32,
  },
  taskInput: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  controls: {
    marginTop: 16,
    width: '100%',
    maxWidth: 320,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    paddingHorizontal: 32,
  },
  buttonPrimary: {
    minWidth: 160,
  },
  buttonSecondary: {
    minWidth: 160,
    borderWidth: 1,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    minWidth: 100,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
