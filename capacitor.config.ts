import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.university.student.portal',
  appName: 'Nexus Student',
  webDir: 'dist',
  server: {
    url: 'https://nexus-student.vercel.app', // TODO: REPLACE WITH YOUR ACTUAL URL
    androidScheme: 'https',
    allowNavigation: ['nexus-student.vercel.app', 'pbyggqsewoxhdbrkuzjt.supabase.co']
  }
};


export default config;
