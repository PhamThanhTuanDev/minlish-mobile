import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, BookOpen, Volume2, Plus } from 'lucide-react-native';

import { colors, commonStyles } from '../theme/styles';
import { fetchVocabularySet } from '../services/api';
import { VocabularySet, VocabularyWord } from '../types/api';
import { RootStackParamList } from '../navigation/RootNavigator';

type SetDetailRouteProp = RouteProp<RootStackParamList, 'SetDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SetDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SetDetailRouteProp>();
  const { setId } = route.params;

  const [vocabSet, setVocabSet] = useState<VocabularySet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      setErrorMsg(null);
      try {
        setIsLoading(true);
        const data = await fetchVocabularySet(setId);
        setVocabSet(data);
      } catch (error: any) {
        console.error('Lỗi tải chi tiết bộ từ:', error);
        // Do not set a small fallback; show error so user can retry — prevents misleading 3-item list
        setVocabSet(null);
        // extract message if possible
        try {
          const em = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
          setErrorMsg(String(em));
        } catch (e) {
          setErrorMsg('Đã xảy ra lỗi khi tải dữ liệu.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [setId]);

  const handleLearn = () => {
    if (!vocabSet?.id) {
      Alert.alert('Không thể bắt đầu', 'Không có dữ liệu bộ từ để bắt đầu học.');
      return;
    }
    navigation.navigate('Quiz', { setId: vocabSet.id });
  };

  const handlePronounce = (word: string) => {
    // If expo-speech is installed you can replace this Alert with Speech.speak(word)
    Alert.alert('Phát âm', `Đọc từ: ${word}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await (async () => {
      try {
        await loadDetail();
      } catch (e) {
        // already handled in loadDetail
      }
    })();
    setRefreshing(false);
  };

  const renderWordItem = ({ item, index }: { item: VocabularyWord; index: number }) => (
    <View style={styles.wordCard}>
      <View style={styles.wordHeader}>
        <View style={styles.wordTitleRow}>
          <Text style={styles.wordIndex}>{index + 1}.</Text>
          <Text style={styles.wordText}>{item.word}</Text>
          {item.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => handlePronounce(item.word)} style={styles.soundBtn}>
          <Volume2 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {item.pronunciation ? (
        <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
      ) : null}
      
      <View style={styles.divider} />
      
      <Text style={styles.meaningText}>{item.meaning}</Text>
      
      {item.example ? (
        <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>Ví dụ: {item.example}</Text>
        </View>
      ) : null}
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addWordBtn}>
          <Plus size={20} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <Text style={styles.setTitle}>{vocabSet?.name}</Text>
      {vocabSet?.description ? (
        <Text style={styles.setDescription}>{vocabSet.description}</Text>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>{vocabSet?.words?.length || 0} từ vựng</Text>
        </View>
        <TouchableOpacity style={styles.learnBtn} onPress={handleLearn}>
          <BookOpen size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.learnBtnText}>Học bộ này</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <View style={[styles.center, { padding: 24 }] }>
          <Text style={{ color: colors.error, marginBottom: 12, textAlign: 'center' }}>Lỗi tải chi tiết bộ từ:</Text>
          <Text style={{ color: colors.textLight, marginBottom: 20, textAlign: 'center' }}>{errorMsg}</Text>
          <TouchableOpacity style={[commonStyles.button, commonStyles.buttonPrimary, { width: '60%' }]} onPress={loadDetail}>
            <Text style={commonStyles.buttonTextPrimary}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <FlatList
        data={vocabSet?.words || []}
        keyExtractor={(item) => item.id}
        renderItem={renderWordItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: 'center', color: colors.textLight }}>Không có từ vựng để hiển thị.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  addWordBtn: {
    padding: 8,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
  },
  setTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  setDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statBadgeText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: 13,
  },
  learnBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  learnBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  wordCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  wordIndex: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginRight: 6,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  typeText: {
    color: '#4f46e5',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  soundBtn: {
    padding: 4,
  },
  pronunciationText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 24, // Thụt lề cho bằng với chữ wordText
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  meaningText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  exampleBox: {
    backgroundColor: '#f8fafb',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  exampleText: {
    fontSize: 13,
    color: colors.textLight,
    fontStyle: 'italic',
  }
});