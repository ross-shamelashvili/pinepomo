import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface DailyProgressProps {
  completed: number;
  goal: number;
}

export function DailyProgress({ completed, goal }: DailyProgressProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const dots = Array.from({ length: goal }, (_, i) => i < completed);

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {dots.map((isCompleted, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: isCompleted ? colors.primary : colors.dotEmpty,
                borderColor: isCompleted ? colors.primary : colors.dotBorder,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {completed} of {goal}
      </Text>
    </View>
  );
}

const lightColors = {
  primary: '#16a34a',
  dotEmpty: '#f3f4f6',
  dotBorder: '#d1d5db',
  textMuted: '#9ca3af',
};

const darkColors = {
  primary: '#22c55e',
  dotEmpty: '#2d2d44',
  dotBorder: '#374151',
  textMuted: '#6b7280',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
  },
});
