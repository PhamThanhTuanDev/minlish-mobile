import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, BookOpen, Volume2, Plus, Edit, Trash2, Search, X } from 'lucide-react-native';

import { colors, commonStyles } from '../theme/styles';
import { fetchVocabularySet, addVocabularyToSet, updateVocabulary, deleteVocabulary } from '../services/api';
import { VocabularySet, VocabularyWord } from '../types/api';
import { RootStackParamList } from '../navigation/RootNavigator';

type SetDetailRouteProp = RouteProp<RootStackParamList, 'SetDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SetDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SetDetailRouteProp>();
  const { setId } = route.params;

  const [vocabSet, setVocabSet] = useState<VocabularySet | null>(null);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    word: '', pronunciation: '', meaning: '', type: '', example: '', note: ''
  });

  const loadDetail = async () => {
    setErrorMsg(null);
    try {
      setIsLoading(true);
      const data = await fetchVocabularySet(setId);
      setVocabSet(data);
      setWords(data.words || []);
    } catch (error: any) {
      console.error('L?i t?i chi ti?t b? t?:', error);
      setVocabSet(null);
      setWords([]);
      try {
        const em = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
        setErrorMsg(String(em));
      } catch (e) {
        setErrorMsg('Ðã x?y ra l?i khi t?i d? li?u.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [setId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchVocabularySet(setId);
      setVocabSet(data);
      setWords(data.words || []);
      setErrorMsg(null);
    } catch(e) { }
    setRefreshing(false);
  };

  const handleLearn = () => {
    if (!vocabSet?.id || words.length === 0) {
      Alert.alert('Không th? b?t d?u', 'B? t? v?ng này không có t? nào d? h?c.');
      return;
    }
    navigation.navigate('Quiz', { setId: vocabSet.id });
  };

  const handlePronounce = (word: string) => {
    Alert.alert('Phát âm', \Ð?c t?: \\);
  };

  const handleOpenForm = (word?: VocabularyWord) => {
    if (word) {
      setEditingWordId(word.id);
      setForm({
        word: word.word || '',
        pronunciation: word.pronunciation || '',
        meaning: word.meaning || '',
        type: word.type || '',
        example: word.example || '',
        note: word.note || ''
      });
    } else {
      setEditingWordId(null);
      setForm({ word: '', pronunciation: '', meaning: '', type: '', example: '', note: '' });
    }
    setModalVisible(true);
  };

  const handleSaveForm = async () => {
    if (!form.word || !form.meaning) {
      Alert.alert('L?i', 'Vui lòng nh?p T? và Nghia.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingWordId) {
        const updated = await updateVocabulary(editingWordId, form);
        setWords(prev => prev.map(w => w.id === editingWordId ? { ...w, ...updated } : w));
        Alert.alert('Thành công', 'Ðã c?p nh?t t? v?ng');
      } else {
        const added = await addVocabularyToSet(setId, form);
        setWords(prev => [...prev, added]);
        Alert.alert('Thành công', 'Ðã thêm t? m?i');
      }
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('L?i', e.message || 'Không th? luu t? v?ng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (wordId: string) => {
    Alert.alert('Xóa t? này?', 'T? này s? b? xóa kh?i b? t? v?ng.', [
      { text: 'H?y', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteVocabulary(wordId);
            setWords(prev => prev.filter(w => w.id !== wordId));
          } catch(e:any) {
            Alert.alert('L?i', 'Không th? xóa t? này');
          }
      }}
    ]);
  };

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWordItem = ({ item, index }: { item: VocabularyWord; index: number }) => (
    <View style={styles.wordCard}>
      <View style={styles.wordHeader}>
        <View style={styles.wordTitleRow}>
          <Text style={styles.wordIndex}>{index + 1}.</Text>
          <Text style={styles.wordText}>{item.word}</Text>
          {item.type ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => handlePronounce(item.word)} style={styles.iconBtn}>
            <Volume2 size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenForm(item)} style={styles.iconBtn}>
            <Edit size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.pronunciation ? (
        <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
      ) : null}
      
      <View style={styles.divider} />
      
      <Text style={styles.meaningText}>{item.meaning}</Text>
      
      {item.example ? (
        <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>Ví d?: {item.example}</Text>
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
        <TouchableOpacity style={styles.addWordBtn} onPress={() => handleOpenForm()}>
          <Plus size={20} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <Text style={styles.setTitle}>{vocabSet?.name}</Text>
      {vocabSet?.description ? (
        <Text style={styles.setDescription}>{vocabSet.description}</Text>
      ) : null}

      {/* Stats & Actions */}
      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>{words.length} t? v?ng</Text>
        </View>
        <TouchableOpacity style={styles.learnBtn} onPress={handleLearn}>
          <BookOpen size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.learnBtnText}>H?c ôn t?p</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm t? v?ng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[commonStyles.container, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <View style={[styles.center, { padding: 24 }]}>
          <Text style={{ color: colors.error, marginBottom: 12, textAlign: 'center' }}>L?i t?i chi ti?t b? t?:</Text>
          <Text style={{ color: colors.textLight, marginBottom: 20, textAlign: 'center' }}>{errorMsg}</Text>
          <TouchableOpacity style={[commonStyles.button, commonStyles.buttonPrimary, { width: '60%' }]} onPress={loadDetail}>
            <Text style={commonStyles.buttonTextPrimary}>Th? l?i</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={renderWordItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
           <View style={{ padding: 24 }}>
             <Text style={{ textAlign: 'center', color: colors.textLight }}>Không có t? v?ng nào phù h?p.</Text>
           </View>
        )}
      />

      {/* FORM MODAL THEO RESPONSIVE WEB */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 8 }}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editingWordId ? 'S?a t? v?ng' : 'Thêm t? v?ng'}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              
              <Text style={styles.label}>T? ti?ng Anh *</Text>
              <TextInput style={styles.input} placeholder="Ví d?: Hello" value={form.word} onChangeText={(t) => setForm({...form, word: t})} />

              <Text style={styles.label}>Nghia ti?ng Vi?t *</Text>
              <TextInput style={styles.input} placeholder="Ví d?: Xin chào" value={form.meaning} onChangeText={(t) => setForm({...form, meaning: t})} />

              <Text style={styles.label}>Cách phát âm</Text>
              <TextInput style={styles.input} placeholder="Ví d?: /h?'l??/" value={form.pronunciation} onChangeText={(t) => setForm({...form, pronunciation: t})} />

              <Text style={styles.label}>Lo?i t?</Text>
              <TextInput style={styles.input} placeholder="n, v, adj, adv, idiom..." value={form.type} onChangeText={(t) => setForm({...form, type: t})} />

              <Text style={styles.label}>Câu ví d?</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" placeholder="Ví d?: Hello world!" value={form.example} onChangeText={(t) => setForm({...form, example: t})} />

              <Text style={styles.label}>Ghi chú</Text>
              <TextInput style={[styles.input, { height: 80 }]} multiline textAlignVertical="top" placeholder="Ghi chú thêm..." value={form.note} onChangeText={(t) => setForm({...form, note: t})} />

            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[commonStyles.button, commonStyles.buttonPrimary, { width: '100%' }]}
                onPress={handleSaveForm}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.buttonTextPrimary}>Luu t? v?ng</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.text,
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  pronunciationText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 24, // Th?t l?
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
  },

  /* MODAL */
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  modalBody: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#f8fafc'
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  }
});
