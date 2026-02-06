import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.99a97b4a9a7b486aa96d7f0884dd41a8',
  appName: '词忆 - 智能背单词',
  webDir: 'dist',
  server: {
    url: 'https://99a97b4a-9a7b-486a-a96d-7f0884dd41a8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
