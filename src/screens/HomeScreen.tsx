import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Layers, Brain, Target, BarChart3, Zap, BookOpen } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const FEATURES = [
  { icon: Layers, title: 'Flashcard', desc: 'H?c t? v?ng tr?c quan' },
  { icon: Brain, title: 'Spaced Repetition', desc: 'Thu?t toán nh? lâu' },
  { icon: Target, title: 'Collocation', desc: 'H?c theo ng? c?nh' },
  { icon: BarChart3, title: 'Ti?n d?', desc: 'Theo dõi m?i ngày' }
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.badge}>Minlish App ??</Text>
          <Text style={styles.title}>
            Master Vocabulary{'\n'}
            <Text style={styles.titleHighlight}>The Smart Way</Text>
          </Text>
          <Text style={styles.subtitle}>
            ?ng d?ng h?c t? v?ng ti?ng Anh v?i công ngh? Spaced Repetition thông minh, giúp b?n nh? sâu và hi?u qu?.
          </Text>
          
          <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.ctaText}>B?t Ð?u Ngay</Text>
          </TouchableOpacity>
        </View>

        {/* FEATURES GRID */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feat, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.iconBox}>
                <feat.icon size={24} color="#3b82f6" />
              </View>
              <Text style={styles.featureTitle}>{feat.title}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 24, paddingBottom: 60, alignItems: 'center' },
  heroSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  badge: { backgroundColor: '#eff6ff', color: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontWeight: '600', marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#0f172a', lineHeight: 44 },
  titleHighlight: { color: '#3b82f6' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 16, marginBottom: 32, lineHeight: 24, paddingHorizontal: 10 },
  ctaButton: { backgroundColor: '#3b82f6', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 24, shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  ctaText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  featuresContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  featureCard: { width: (width - 64) / 2, backgroundColor: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
  iconBox: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 12, marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  featureDesc: { fontSize: 13, color: '#64748b', textAlign: 'center' },
});
