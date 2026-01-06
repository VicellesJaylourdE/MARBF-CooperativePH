import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'coopabookid.app',
  appName: 'marbf-cooperativeph',
  webDir: 'dist',
  server: {
    androidScheme: 'https' 
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;