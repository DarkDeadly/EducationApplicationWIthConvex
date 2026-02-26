import { FlashList } from '@shopify/flash-list';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../../convex/_generated/api';
import RenderClasse from '../../../../src/features/classAddition/StudentsFeature/Class/components/RenderClasse';
import EmptyState from '../../../../src/shared-features/components/EmptyState';

const index = () => {
  const getClassroomDetail = useQuery(api.classrooms.getClassroom)
  const insets = useSafeAreaInsets();
  
  if (getClassroomDetail === undefined) {
     return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>جاري تحميل الاقسام المتاحة...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Animated.View entering={FadeInRight.duration(600)}>
          <Text style={styles.headerTitle}>استكشف اقسام</Text>
          <Text style={styles.headerSubtitle}>انضم إلى زملائك وابدأ رحلتك التعليمية اليوم</Text>
        </Animated.View>
      </LinearGradient>

      {getClassroomDetail?.length === 0 ? (
        <EmptyState subtitle="لا توجد فصول متاحة حالياً" teacherValid={false} />
      ) : (
        <FlashList
          data={getClassroomDetail}
          renderItem={({ item }) => <RenderClasse item={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default index

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 25, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 30, fontWeight: '900', color: '#fff', textAlign: 'right' },
  headerSubtitle: { fontSize: 15, color: '#E0D4FF', marginTop: 8, textAlign: 'right', fontWeight: '500' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
  // FIX: Added error state styles
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  list: { padding: 20, paddingBottom: 40 }
});