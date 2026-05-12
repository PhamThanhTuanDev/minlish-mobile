import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { EXPO_PROJECT_FULL_NAME, GOOGLE_CLIENT_IDS } from "../config";
import { login, loginWithGoogle, register } from "../services/api";

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const isExpoGo = Constants.appOwnership === "expo";
  const projectNameForProxy = EXPO_PROJECT_FULL_NAME.trim() || undefined;
  const expoProxyRedirectUri = projectNameForProxy
    ? `https://auth.expo.io/${projectNameForProxy}`
    : undefined;

  const effectiveGoogleClientIds = {
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    iosClientId: isExpoGo ? undefined : GOOGLE_CLIENT_IDS.ios || GOOGLE_CLIENT_IDS.web || undefined,
    androidClientId: isExpoGo ? undefined : GOOGLE_CLIENT_IDS.android || GOOGLE_CLIENT_IDS.web || undefined,
  };

  const [googleRequest, googleResponse, promptGoogleLogin] = Google.useAuthRequest({
    clientId: effectiveGoogleClientIds.webClientId ?? "",
    webClientId: effectiveGoogleClientIds.webClientId,
    iosClientId: effectiveGoogleClientIds.iosClientId,
    androidClientId: effectiveGoogleClientIds.androidClientId,
    redirectUri: expoProxyRedirectUri,
  });

  const hasRegisterFields =
    fullName.trim().length > 0 && learningGoal.trim().length > 0 && level.trim().length > 0;
  const canSubmit =
    email.trim().length > 3 &&
    password.length >= 6 &&
    (isLoginMode || hasRegisterFields) &&
    !submitting;

  const canUseGoogle = isExpoGo
    ? Boolean(effectiveGoogleClientIds.webClientId)
    : Platform.OS === "ios"
      ? Boolean(effectiveGoogleClientIds.iosClientId)
      : Platform.OS === "android"
        ? Boolean(effectiveGoogleClientIds.androidClientId)
        : Boolean(effectiveGoogleClientIds.webClientId);

  useEffect(() => {
    const handleGoogle = async () => {
      if (googleResponse?.type !== "success") return;

      const accessToken = googleResponse.authentication?.accessToken;
      const idToken = googleResponse.authentication?.idToken;

      if (!accessToken && !idToken) {
        setError("Không lấy được token từ Google");
        return;
      }

      try {
        setGoogleSubmitting(true);
        setError(null);
        await loginWithGoogle({ accessToken, idToken });
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Google login failed";
        setError(message);
      } finally {
        setGoogleSubmitting(false);
      }
    };

    void handleGoogle();
  }, [googleResponse, navigation]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      if (isLoginMode) {
        await login({ email: email.trim(), password });
      } else {
        await register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          learningGoal: learningGoal.trim(),
          level: level.trim(),
        });
      }
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>MinLish Mobile</Text>
      <Text style={styles.subtitle}>
        {isLoginMode ? "Đăng nhập bằng tài khoản web hiện có" : "Tạo tài khoản mới"}
      </Text>

      <View style={styles.modeSwitchRow}>
        <Pressable
          onPress={() => {
            setIsLoginMode(true);
            setError(null);
          }}
          style={[styles.modeSwitchButton, isLoginMode && styles.modeSwitchButtonActive]}
        >
          <Text style={[styles.modeSwitchText, isLoginMode && styles.modeSwitchTextActive]}>Đăng nhập</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setIsLoginMode(false);
            setError(null);
          }}
          style={[styles.modeSwitchButton, !isLoginMode && styles.modeSwitchButtonActive]}
        >
          <Text style={[styles.modeSwitchText, !isLoginMode && styles.modeSwitchTextActive]}>Đăng ký</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Pressable
          style={[styles.googleButton, (!canUseGoogle || googleSubmitting) && styles.buttonDisabled]}
          onPress={() => promptGoogleLogin()}
          disabled={!canUseGoogle || googleSubmitting || !googleRequest}
        >
          {googleSubmitting ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.googleButtonLabel}>Tiếp tục với Google</Text>
          )}
        </Pressable>

        {!canUseGoogle ? (
          <Text style={styles.hint}>
            Thiếu cấu hình Google Client ID. Thêm EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID trong môi trường Expo.
          </Text>
        ) : null}

        {canUseGoogle && !projectNameForProxy ? (
          <Text style={styles.hint}>
            Thiếu EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME (ví dụ: @your-expo-username/minlish-mobile).
          </Text>
        ) : null}

        {canUseGoogle && isExpoGo && projectNameForProxy ? (
          <Text style={styles.hint}>
            Thêm redirect URI này vào Google Web OAuth client: {expoProxyRedirectUri}
          </Text>
        ) : null}

        {!isLoginMode ? (
          <>
            <TextInput
              placeholder="Tên hiển thị"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Mục tiêu học (IELTS/TOEIC/Communication)"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={learningGoal}
              onChangeText={setLearningGoal}
            />
            <TextInput
              placeholder="Trình độ (A1, A2, B1, B2, C1, C2)"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={level}
              onChangeText={setLevel}
            />
          </>
        ) : null}

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#6b7280"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonLabel}>{isLoginMode ? "Đăng nhập" : "Đăng ký"}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f766e",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },
  modeSwitchRow: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  modeSwitchButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeSwitchButtonActive: {
    backgroundColor: "#0f766e",
  },
  modeSwitchText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  modeSwitchTextActive: {
    color: "#ffffff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  googleButtonLabel: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15,
  },
  hint: {
    color: "#b45309",
    fontSize: 12,
    lineHeight: 16,
  },
});
