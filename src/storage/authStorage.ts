import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config";

export async function saveAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.accessToken);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.accessToken, STORAGE_KEYS.userEmail]);
}

export async function saveUserEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.userEmail, email);
}

export async function getUserEmail(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.userEmail);
}
