export type ThemeId = 'forest' | 'ocean' | 'sunset' | 'minimal';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    primary: {
      50: string;
      100: string;
      400: string;
      500: string;
      600: string;
      700: string;
    };
    accent: {
      400: string;
      500: string;
      600: string;
    };
  };
}

export const themes: Record<ThemeId, Theme> = {
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: {
        50: '#f0f7f4',
        100: '#dbebe2',
        400: '#5f9c87',
        500: '#3f7f6b',
        600: '#2f6555',
        700: '#275146',
      },
      accent: {
        400: '#b89476',
        500: '#a97b5a',
        600: '#9c6a4e',
      },
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      accent: {
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
      },
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
      },
      accent: {
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
      },
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: {
        50: '#fafafa',
        100: '#f5f5f5',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
      },
      accent: {
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
      },
    },
  },
};

export const themeList = Object.values(themes);
