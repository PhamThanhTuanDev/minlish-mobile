import AsyncStorage from '@react-native-async-storage/async-storage';
import { VocabularySet, VocabularyWord, LearningStats } from '../types/api';

const VOCAB_SETS_KEY = 'minlish_vocab_sets';
const LEARNING_STATS_KEY = 'minlish_learning_stats';

interface LocalData {
  sets: VocabularySet[];
  stats: LearningStats;
}

export function createNewWord(
  partial: Partial<VocabularyWord> & { word: string; meaning: string }
): VocabularyWord {
  return {
    id: Math.random().toString(36).substr(2, 9),
    pronunciation: '',
    description: '',
    descriptionVi: '',
    example: '',
    exampleVi: '',
    collocation: '',
    relatedWords: '',
    note: '',
    type: '',
    level: '',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
    correctCount: 0,
    incorrectCount: 0,
    ...partial,
  };
}

const defaultStats: LearningStats = {
  totalWords: 0,
  totalStudyRounds: 0,
  wordsLearned: 0,
  streak: 0,
  accuracy: 0,
  dailyActivity: [],
  retentionRate: 0,
};

export async function getVocabularySets(): Promise<VocabularySet[]> {
  try {
    const data = await AsyncStorage.getItem(VOCAB_SETS_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((set: any) => ({
      ...set,
      createdAt: new Date(set.createdAt),
      updatedAt: new Date(set.updatedAt),
      words: set.words.map((w: any) => ({
        ...w,
        nextReview: new Date(w.nextReview),
        lastReviewed: w.lastReviewed ? new Date(w.lastReviewed) : undefined,
      })),
    }));
  } catch (error) {
    console.error('Error loading vocabulary sets:', error);
    return [];
  }
}

export async function getVocabularySet(id: string): Promise<VocabularySet | null> {
  try {
    const sets = await getVocabularySets();
    return sets.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Error getting vocabulary set:', error);
    return null;
  }
}

export async function saveVocabularySet(set: VocabularySet): Promise<void> {
  try {
    const sets = await getVocabularySets();
    const index = sets.findIndex(s => s.id === set.id);
    
    if (index >= 0) {
      sets[index] = set;
    } else {
      sets.push(set);
    }
    
    await AsyncStorage.setItem(VOCAB_SETS_KEY, JSON.stringify(sets));
  } catch (error) {
    console.error('Error saving vocabulary set:', error);
    throw error;
  }
}

export async function deleteVocabularySet(id: string): Promise<void> {
  try {
    const sets = await getVocabularySets();
    const filtered = sets.filter(s => s.id !== id);
    await AsyncStorage.setItem(VOCAB_SETS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting vocabulary set:', error);
    throw error;
  }
}

export async function getLearningStats(): Promise<LearningStats> {
  try {
    const data = await AsyncStorage.getItem(LEARNING_STATS_KEY);
    if (!data) return defaultStats;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading learning stats:', error);
    return defaultStats;
  }
}

export async function saveLearningStats(stats: LearningStats): Promise<void> {
  try {
    await AsyncStorage.setItem(LEARNING_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving learning stats:', error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([VOCAB_SETS_KEY, LEARNING_STATS_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
