import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { EXPO_PROJECT_FULL_NAME, GOOGLE_CLIENT_IDS } from '../config';
import { login, loginWithGoogle, register } from '../services/api';
import { colors } from '../theme/styles';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LEARNING_GOALS = ['IELTS', 'TOEIC', 'Communication'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function LoginScreen({ navigation }: Props) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [learningGoal, setLearningGoal] = useState('IELTS');
  const [level, setLevel] = useState('B1');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const isExpoGo = Constants.appOwnership === 'expo';
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
    clientId: effectiveGoogleClientIds.webClientId ?? '',
    webClientId: effectiveGoogleClientIds.webClientId,
    iosClientId: effectiveGoogleClientIds.iosClientId,
    androidClientId: effectiveGoogleClientIds.androidClientId,
    redirectUri: expoProxyRedirectUri,
  });

  const isEmailValid = email.trim().length > 3 && email.includes('@');
  const isPasswordValid = password.length >= 6;
  const hasRegisterFields = fullName.trim().length > 0;
  const canSubmit =
    isEmailValid &&
    isPasswordValid &&
    (isLoginMode || hasRegisterFields) &&
    !submitting;

  const canUseGoogle = isExpoGo
    ? Boolean(effectiveGoogleClientIds.webClientId)
    : Platform.OS === 'ios'
      ? Boolean(effectiveGoogleClientIds.iosClientId)
      : Platform.OS === 'android'
        ? Boolean(effectiveGoogleClientIds.androidClientId)
        : Boolean(effectiveGoogleClientIds.webClientId);

  useEffect(() => {
    const handleGoogle = async () => {
      if (googleResponse?.type !== 'success') return;

      const accessToken = googleResponse.authentication?.accessToken;
      const idToken = googleResponse.authentication?.idToken;

      if (!accessToken && !idToken) {
        setError('Không lấy được token từ Google');
        return;
      }

      try {
        setGoogleSubmitting(true);
        setError(null);
        await loginWithGoogle({ accessToken, idToken });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google login failed';
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
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📚</Text>
            </View>
            <Text style={styles.appTitle}>MinLish</Text>
            <Text style={styles.appSubtitle}>
              {isLoginMode
                ? 'Đăng nhập để tiếp tục học'
                : 'Tạo tài khoản để bắt đầu'}
            </Text>
          </View>

          {/* Mode Switcher */}
          <View style={styles.modeSwitch}>
            <Pressable
              style={[styles.modeSwitchButton, isLoginMode && styles.modeSwitchButtonActive]}
              onPress={() => isLoginMode || handleToggleMode()}
            >
              <Text
                style={[
                  styles.modeSwitchText,
                  isLoginMode && styles.modeSwitchTextActive,
                ]}
              >
                Đăng nhập
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeSwitchButton, !isLoginMode && styles.modeSwitchButtonActive]}
              onPress={() => !isLoginMode || handleToggleMode()}
            >
              <Text
                style={[
                  styles.modeSwitchText,
                  !isLoginMode && styles.modeSwitchTextActive,
                ]}
              >
                Đăng ký
              </Text>
            </Pressable>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Google Login Button */}
            <Pressable
              style={[
                styles.googleButton,
                (googleSubmitting || !googleRequest) && styles.buttonDisabled,
              ]}
              onPress={() => promptGoogleLogin()}
              disabled={!canUseGoogle || googleSubmitting || !googleRequest}
            >
              {googleSubmitting ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <>
                  <Text style={styles.googleButtonIcon}>🔷</Text>
                  <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.divider} />
            </View>

            {/* Register Fields */}
            {!isLoginMode && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tên hiển thị</Text>
                  <TextInput
                    placeholder="Ví dụ: Nguyễn Văn A"
                    placeholderTextColor={colors.textLight}
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!submitting}
                  />
                </View>

                <View style={styles.rowContainer}>
                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Mục tiêu</Text>
                    <Pressable
                      style={styles.selectButton}
                      onPress={() => {
                        const options = LEARNING_GOALS.map((goal) => ({
                          text: goal,
                          onPress: () => setLearningGoal(goal),
                        }));
                        options.push({ text: 'Hủy', onPress: () => {} });
                        Alert.alert('Chọn mục tiêu', '', options);
                      }}
                    >
                      <Text style={styles.selectButtonText}>{learningGoal}</Text>
                      <Text style={styles.selectButtonArrow}>▼</Text>
                    </Pressable>
                  </View>

                  <View style={styles.formGroupHalf}>
                    <Text style={styles.label}>Trình độ</Text>
                    <Pressable
                      style={styles.selectButton}
                      onPress={() => {
                        const options = LEVELS.map((lv) => ({
                          text: lv,
                          onPress: () => setLevel(lv),
                        }));
                        options.push({ text: 'Hủy', onPress: () => {} });
                        Alert.alert('Chọn trình độ', '', options);
                      }}
                    >
                      <Text style={styles.selectButtonText}>{level}</Text>
                      <Text style={styles.selectButtonArrow}>▼</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            {/* Email Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="your@email.com"
                placeholderTextColor={colors.textLight}
                style={[styles.input, !isEmailValid && email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                editable={!submitting}
              />
              {!isEmailValid && email && (
                <Text style={styles.errorText}>Email không hợp lệ</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textLight}
                style={[styles.input, !isPasswordValid && password && styles.inputError]}
                value={password}
                onChangeText={setPassword}
                editable={!submitting}
              />
              {!isPasswordValid && password && (
                <Text style={styles.errorText}>
                  Mật khẩu phải có ít nhất 6 ký tự
                </Text>
              )}
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              style={[
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
                </Text>
              )}
            </Pressable>

            {/* Footer Text */}
            <Text style={styles.footerText}>
              {isLoginMode
                ? 'Chưa có tài khoản? '
                : 'Đã có tài khoản? '}
              <Text
                style={styles.footerLink}
                onPress={handleToggleMode}
              >
                {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
              </Text>
            </Text>
          </View>

          {/* Info Messages */}
          {!canUseGoogle && (
            <Text style={styles.infoText}>
              ℹ️ Thiếu cấu hình Google Client ID
            </Text>
          )}

          {canUseGoogle && !projectNameForProxy && (
            <Text style={styles.infoText}>
              ℹ️ Thiếu EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerIconText: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f0f9f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  modeSwitchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeSwitchButtonActive: {
    backgroundColor: colors.primary,
  },
  modeSwitchText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  modeSwitchTextActive: {
    color: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  googleButtonIcon: {
    fontSize: 18,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textLight,
  },
  formGroup: {
    marginBottom: 14,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    minHeight: 44,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#fef2f2',
  },
  selectButton: {
    fontSize: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  selectButtonArrow: {
    fontSize: 10,
    color: colors.textLight,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  errorIcon: {
    fontSize: 18,
  },
  errorMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  footerText: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});
