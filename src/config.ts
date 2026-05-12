export const API_BASE_URL = "https://api.minlish.site";

export const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
} as const;

export const EXPO_PROJECT_FULL_NAME = process.env.EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME ?? "";

export const STORAGE_KEYS = {
  accessToken: "minlish_access_token",
  userEmail: "minlish_user_email",
} as const;
