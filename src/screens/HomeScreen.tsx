import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookOpen, Flame, Target, Clock, User } from 'lucide-react-native';

import { RootStackParamList } from '../navigation/RootNavigator';
import { getMyProfile, fetchLearningStats } from '../services/api';
import { UserProfile, LearningStats } from '../types/api'; // Đảm bảo bạn đã define type này
import { colors, commonStyles } from '../theme/styles'; // Adjust đường dẫn nếu cần

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // 1. Lấy Profile (Vẫn throw error nếu lỗi auth/mạng hỏng hẳn)
      const profileData = await getMyProfile();
      setProfile(profileData);

      // 2. Lấy Stats (Nếu lỗi 500 thì bắt lỗi riêng và dùng data mặc định)
      try {
        const statsData = await fetchLearningStats();
        setStats(statsData);
      } catch (statsError) {
        console.warn('Lỗi API Stats, dùng dữ liệu mặc định:', statsError);
        // Fallback data tạm thời để UI vẫn render được (đảm bảo đầy đủ fields của LearningStats)
        setStats({
          totalWords: 0,
          totalStudyRounds: 0,
          wordsLearned: 0,
          streak: 0,
          streakDays: 0,
          accuracy: 0,
          dailyActivity: [],
          retentionRate: 0,
          levelEstimate: undefined,
          last30DaysTimeSpent: 0,
          last30DaysNewWords: 0,
          last30DaysStudyDays: 0,
          totalTimeSpent: 0,
          totalStudyDays: 0,
        });
      }

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu trang chủ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.centerElement]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header - Lời chào */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Chào mừng trở lại,</Text>
            <Text style={styles.nameText}>{profile?.fullName || 'Học viên'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton}>
            <User color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Học từ vựng{'\n'}thông minh hơn</Text>
          <Text style={styles.heroSubtitle}>
            Theo dõi tiến độ, ôn tập khoa học với thuật toán lặp lại ngắt quãng (Spaced Repetition).
          </Text>
          
          <View style={styles.heroActionRow}>
            <TouchableOpacity 
              style={[commonStyles.button, styles.btnOutline]}
              // onPress={() => navigation.navigate('VocabularyManagement')} // Thêm route sau
            >
              <Text style={styles.btnOutlineText}>Quản lý từ vựng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[commonStyles.button, styles.btnAccent]}
              // onPress={() => navigation.navigate('LearnScreen')} // Thêm route sau
            >
              <Text style={styles.btnAccentText}>Học ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thống kê tiến độ */}
        <View style={styles.section}>
          <Text style={commonStyles.title}>Tiến độ học tập</Text>
          
          <View style={styles.statsGrid}>
            {/* Thẻ 1: Số từ đã học */}
            <View style={commonStyles.card}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#e0f2f1' }]}>
                  <BookOpen color={colors.primary} size={20} />
                </View>
              </View>
              <Text style={styles.statValue}>
                {stats?.wordsLearned ?? stats?.totalWords ?? 0}
              </Text>
              <Text style={commonStyles.subtitle}>Từ đã học</Text>
            </View>

            {/* Thẻ 2: Streak */}
            <View style={commonStyles.card}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#fef3c7' }]}>
                  <Flame color={colors.warning} size={20} />
                </View>
              </View>
              <Text style={styles.statValue}>
                {stats?.streakDays ?? stats?.streak ?? 0}
              </Text>
              <Text style={commonStyles.subtitle}>Ngày streak</Text>
            </View>

            {/* Thẻ 3: Độ chính xác / EXP */}
            <View style={commonStyles.card}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#e0e7ff' }]}>
                  <Target color="#4f46e5" size={20} />
                </View>
              </View>
              <Text style={styles.statValue}>
                {/* @ts-ignore */}
                {stats?.accuracy || 0}%
              </Text>
              <Text style={commonStyles.subtitle}>Độ chính xác</Text>
            </View>

            {/* Thẻ 4: Thời gian học */}
            <View style={commonStyles.card}>
              <View style={styles.statHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: '#ffedd5' }]}>
                  <Clock color="#ea580c" size={20} />
                </View>
              </View>
              <Text style={styles.statValue}>
                 {/* @ts-ignore */}
                 {stats?.totalTimeSpentMinutes || 0}p
              </Text>
              <Text style={commonStyles.subtitle}>Đã học</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerElement: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e0f2f1',
    lineHeight: 20,
    marginBottom: 24,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnOutline: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnOutlineText: {
    color: colors.surface,
    fontWeight: '600',
  },
  btnAccent: {
    flex: 1,
    backgroundColor: colors.accent,
  },
  btnAccentText: {
    color: colors.text, // Text đậm màu cho nền vàng
    fontWeight: '700',
  },
  section: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
});