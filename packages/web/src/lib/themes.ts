export type ThemeId =
  | 'forest'
  | 'ocean'
  | 'sunset'
  | 'minimal'
  | 'dracula'
  | 'nord'
  | 'catppuccin'
  | 'tokyoNight'
  | 'gruvbox'
  | 'monokai';

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
  // === Original themes ===
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

  // === Nerd themes ===
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      primary: {
        50: '#fcf5ff',
        100: '#f3e6ff',
        400: '#bd93f9',
        500: '#bd93f9',
        600: '#a855f7',
        700: '#9333ea',
      },
      accent: {
        400: '#ff79c6',
        500: '#ff79c6',
        600: '#ec4899',
      },
    },
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    colors: {
      primary: {
        50: '#eceff4',
        100: '#e5e9f0',
        400: '#88c0d0',
        500: '#81a1c1',
        600: '#5e81ac',
        700: '#4c6a94',
      },
      accent: {
        400: '#a3be8c',
        500: '#8fbcbb',
        600: '#7aa89f',
      },
    },
  },
  catppuccin: {
    id: 'catppuccin',
    name: 'Catppuccin',
    colors: {
      primary: {
        50: '#f5e6f5',
        100: '#ecdcf5',
        400: '#cba6f7',
        500: '#cba6f7',
        600: '#b48bf2',
        700: '#9d6de8',
      },
      accent: {
        400: '#f5c2e7',
        500: '#f38ba8',
        600: '#e85d8c',
      },
    },
  },
  tokyoNight: {
    id: 'tokyoNight',
    name: 'Tokyo',
    colors: {
      primary: {
        50: '#e6f0ff',
        100: '#cce0ff',
        400: '#7aa2f7',
        500: '#7aa2f7',
        600: '#5d8df0',
        700: '#4078e8',
      },
      accent: {
        400: '#bb9af7',
        500: '#9d7cd8',
        600: '#8561c9',
      },
    },
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    colors: {
      primary: {
        50: '#fbf1c7',
        100: '#f2e5bc',
        400: '#b8bb26',
        500: '#98971a',
        600: '#79740e',
        700: '#5a5a0a',
      },
      accent: {
        400: '#fabd2f',
        500: '#d79921',
        600: '#b57614',
      },
    },
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      primary: {
        50: '#f8f8f2',
        100: '#f0f0ea',
        400: '#a6e22e',
        500: '#a6e22e',
        600: '#8bc220',
        700: '#6f9a18',
      },
      accent: {
        400: '#f92672',
        500: '#f92672',
        600: '#d41d5c',
      },
    },
  },
};

export const themeList = Object.values(themes);
