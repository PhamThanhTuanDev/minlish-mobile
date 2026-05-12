import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getMyProfile } from "../services/api";
import { clearSession } from "../storage/authStorage";
import { UserProfile } from "../types/api";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Cannot load profile");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Welcome to MinLish Mobile</Text>

      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator color="#0f766e" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{profile?.fullName || "-"}</Text>

            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile?.email || "-"}</Text>

            <Text style={styles.label}>Goal</Text>
            <Text style={styles.value}>{profile?.learningGoal || "-"}</Text>

            <Text style={styles.label}>Level</Text>
            <Text style={styles.value}>{profile?.level || "-"}</Text>
          </>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 42,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    minHeight: 220,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
