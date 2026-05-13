import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getMyProfile, fetchLearningStats } from "../services/api";
import { clearSession } from "../storage/authStorage";
import { UserProfile, LearningStats } from "../types/api";
import { colors } from "../theme/styles";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [profileData, statsData] = await Promise.all([
        getMyProfile(),
        fetchLearningStats()
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    }
  };

  useEffect(() => {
    setLoading(true);
    void loadData().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await clearSession();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const StatCard = ({ icon, value, label, color }: { icon: string, value: number | string, label: string, color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Chào mừng trở lại, 👋</Text>
            <Text style={styles.name}>{profile?.fullName || "Học viên"}</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{profile?.fullName?.charAt(0)?.toUpperCase() || "U"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan học tập</Text>
          
          {loading && !refreshing ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={loadData}>
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <StatCard 
                icon="📖" 
                value={stats?.totalWords || 0} 
                label="Số từ đã học" 
                color={colors.primary} 
              />
              <StatCard 
                icon="🔥" 
                value={stats?.streakDays || stats?.streak || 0} 
                label="Ngày Streak" 
                color={colors.warning} 
              />
              <StatCard 
                icon="🎯" 
                value={`${stats?.accuracy || 0}%`} 
                label="Độ chính xác" 
                color={colors.primary} 
              />
              <StatCard 
                icon="📈" 
                value={stats?.totalStudyRounds || 0} 
                label="Lượt học" 
                color={colors.success} 
              />
            </View>
          )}
        </View>

        {!loading && profile && (
          <View style={[styles.section, styles.profileSection]}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Mục tiêu</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{profile.learningGoal || "Chưa đặt"}</Text>
                </View>
              </View>
              <View style={styles.profileDivider} />
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Trình độ</Text>
                <View style={[styles.badge, styles.badgeAlt]}>
                  <Text style={[styles.badgeText, styles.badgeTextAlt]}>{profile.level || "Cơ bản"}</Text>
                </View>
              </View>
              <View style={styles.profileDivider} />
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Ước lượng</Text>
                <View style={[styles.badge, styles.badgeSuccess]}>
                  <Text style={[styles.badgeText, styles.badgeTextSuccess]}>{stats?.levelEstimate || "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
         <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  statInfo: {
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  profileSection: {
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  badge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  badgeAlt: {
    backgroundColor: colors.accent + '20',
  },
  badgeTextAlt: {
    color: '#d97706',
  },
  badgeSuccess: {
    backgroundColor: colors.success + '15',
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: colors.error,
    fontWeight: "600",
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  logoutText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});