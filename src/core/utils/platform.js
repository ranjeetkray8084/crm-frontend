// Platform utilities for Web & Mobile compatibility

/**
 * Storage abstraction layer
 * Can be easily adapted for React Native AsyncStorage
 */
export class Storage {
  static async setItem(key, value) {
    try {
      if (typeof window !== 'undefined') {
        // Web environment
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } else {
        // Mobile environment - would use AsyncStorage
        // await AsyncStorage.setItem(key, JSON.stringify(value));
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  static async getItem(key) {
    try {
      if (typeof window !== 'undefined') {
        // Web environment
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } else {
        // Mobile environment - would use AsyncStorage
        // const item = await AsyncStorage.getItem(key);
        // return item ? JSON.parse(item) : null;
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  static async removeItem(key) {
    try {
      if (typeof window !== 'undefined') {
        // Web environment
        localStorage.removeItem(key);
        return true;
      } else {
        // Mobile environment - would use AsyncStorage
        // await AsyncStorage.removeItem(key);
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  static async clear() {
    try {
      if (typeof window !== 'undefined') {
        // Web environment
        localStorage.clear();
        return true;
      } else {
        // Mobile environment - would use AsyncStorage
        // await AsyncStorage.clear();
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

/**
 * Navigation abstraction layer
 * Can be easily adapted for React Navigation
 */
export class Navigation {
  static navigate(route, params = {}) {
    if (typeof window !== 'undefined') {
      // Web environment - using React Router
      if (window.navigate) {
        window.navigate(route, params);
      } else {
        window.location.href = route;
      }
    } else {
      // Mobile environment - would use React Navigation
      // navigation.navigate(route, params);
    }
  }

  static goBack() {
    if (typeof window !== 'undefined') {
      // Web environment
      window.history.back();
    } else {
      // Mobile environment - would use React Navigation
      // navigation.goBack();
    }
  }

  static replace(route, params = {}) {
    if (typeof window !== 'undefined') {
      // Web environment
      if (window.navigate) {
        window.navigate(route, { replace: true, ...params });
      } else {
        window.location.replace(route);
      }
    } else {
      // Mobile environment - would use React Navigation
      // navigation.replace(route, params);
    }
  }
}

/**
 * Alert abstraction layer
 * Can be easily adapted for React Native Alert
 */
export class Alert {
  static show(message, type = 'info') {
    if (typeof window !== 'undefined') {
      // Web environment - using custom alert
      if (window.customAlert) {
        window.customAlert(message);
      } else {
        alert(message);
      }
    } else {
      // Mobile environment - would use React Native Alert
      // Alert.alert('CRM App', message);
    }
  }

  static confirm(message, onConfirm, onCancel) {
    if (typeof window !== 'undefined') {
      // Web environment
      if (confirm(message)) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
    } else {
      // Mobile environment - would use React Native Alert
      // Alert.alert('CRM App', message, [
      //   { text: 'Cancel', onPress: onCancel },
      //   { text: 'OK', onPress: onConfirm }
      // ]);
    }
  }
}

/**
 * Device information
 */
export class Device {
  static getPlatform() {
    if (typeof window !== 'undefined') {
      return 'web';
    } else {
      // Would detect iOS/Android in React Native
      return 'mobile';
    }
  }

  static isWeb() {
    return typeof window !== 'undefined';
  }

  static isMobile() {
    return !this.isWeb();
  }

  static getScreenDimensions() {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    } else {
      // Would use Dimensions from React Native
      return { width: 0, height: 0 };
    }
  }
}