import AsyncStorage from '@react-native-async-storage/async-storage';

// Synchronous localStorage polyfill for React Native
// Uses a cache for synchronous access, with async persistence
class LocalStoragePolyfill {
  private cache: Map<string, string> = new Map();

  constructor() {
    this.loadFromAsyncStorage();
  }

  private async loadFromAsyncStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      items.forEach(([key, value]) => {
        if (value !== null) {
          this.cache.set(key, value);
        }
      });
    } catch (e) {
      console.warn('Failed to load from AsyncStorage:', e);
    }
  }

  getItem(key: string): string | null {
    return this.cache.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value);
    AsyncStorage.setItem(key, value).catch(console.warn);
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    AsyncStorage.removeItem(key).catch(console.warn);
  }

  clear(): void {
    this.cache.clear();
    AsyncStorage.clear().catch(console.warn);
  }

  get length(): number {
    return this.cache.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.cache.keys());
    return keys[index] ?? null;
  }
}

// Install polyfill if localStorage doesn't exist
if (typeof globalThis !== 'undefined' && !(globalThis as any).localStorage) {
  (globalThis as any).localStorage = new LocalStoragePolyfill();
}

export {};
