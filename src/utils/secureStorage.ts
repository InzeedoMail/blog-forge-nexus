
export const secureStorage = {
  // In a real production app, you would use encryption here
  setItem: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error storing ${key} in secure storage:`, error);
    }
  },

  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(`Error retrieving ${key} from secure storage:`, error);
      return defaultValue;
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
    }
  }
};
