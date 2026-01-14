import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useMemo, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createTimerStore } from '@pinepomo/core';

export default function TimerScreen() {
  const timerStore = useMemo(() => createTimerStore(), []);
  const { session, remainingSeconds, config } = timerStore();

  // Tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      timerStore.getState().tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStore]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleStart = () => {
    timerStore.getState().start();
  };

  const handlePause = () => {
    timerStore.getState().pause();
  };

  const handleResume = () => {
    timerStore.getState().resume();
  };

  const handleCancel = () => {
    timerStore.getState().cancel();
    timerStore.getState().reset();
  };

  const status = session?.status ?? 'idle';
  const displayTime = status === 'idle' ? config.workMins * 60 : remainingSeconds;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pinepomo</Text>
      <Text style={styles.timer}>{formatTime(displayTime)}</Text>
      <Text style={styles.status}>{status.toUpperCase()}</Text>

      <View style={styles.controls}>
        {status === 'idle' && (
          <Pressable style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
        )}
        {status === 'running' && (
          <Pressable style={styles.button} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </Pressable>
        )}
        {status === 'paused' && (
          <>
            <Pressable style={styles.button} onPress={handleResume}>
              <Text style={styles.buttonText}>Resume</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </>
        )}
        {status === 'completed' && (
          <Pressable style={styles.button} onPress={handleCancel}>
            <Text style={styles.buttonText}>Reset</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 40,
  },
  timer: {
    fontSize: 72,
    fontWeight: '200',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontSize: 16,
    color: '#888888',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
  },
  button: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
