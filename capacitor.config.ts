import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goaljournal.app',
  appName: 'Goal Journal',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    CapacitorHttp: {
      enabled: true
    },
    Share: {
      shareTitle: "分享到Goal Journal",
      shareSubject: "收藏連結",
      shareDescription: "將此連結加入到你的收藏"
    }
  },
  ios: {
    contentInset: "always",
    scheme: "goaljournal",
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
