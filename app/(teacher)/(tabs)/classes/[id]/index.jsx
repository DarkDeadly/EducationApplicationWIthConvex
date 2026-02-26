import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from "../../../../../convex/_generated/api";

const ClassroomContent = () => {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const ClassDetails = useQuery(api.classrooms.getPupilsInClass , {
    classroomId : id
  })
  const Courses = useQuery(api.courses.getClassCourses , {
    classroomId : id
  })
  console.log(Courses)
  // Data Fetching
 console.log(ClassDetails)

  // --- SUB-COMPONENTS FOR FLATLIST ---

    const HeaderComponent = () => (
    <View>
    
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.header}>
        <Text style={styles.classTitle}>{ClassDetails?.classroom.name}</Text>
        
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{ClassDetails?.count || 0}</Text>
            <Text style={styles.statLabel}>تلميذ</Text>
          </View>
        </View>
      </LinearGradient>

   
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push(`(teacher)/(tabs)/classes/${id}/points`)}
        >
          <Ionicons name="trophy-outline" size={32} color="#8B5CF6" />
          <Text style={styles.actionText}>ادارة نقاط</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push(`(teacher)/(tabs)/classes/${id}/courseAdd`)}
        >
          <Ionicons name="book-outline" size={32} color="#F59E0B" />
          <Text style={styles.actionText}>إضافة دروس</Text>
        </TouchableOpacity>
      </View>

     
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>الدروس</Text>
      </View>
    </View>
  );

   const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>لم يتم إضافة دروس بعد</Text>
      <Text style={styles.emptyStateSubText}>انقر على "إضافة دروس" للبدء</Text>
    </View>
  );
  



      const renderCourseItem = ({ item: course, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={{ paddingHorizontal: 20 }}
    >
      <TouchableOpacity 
        style={styles.courseCard}
        onPress={() => {
         
          router.push(`(teacher)/(tabs)/classes/${id}/${course?._id}`);
        }}
      >
        <View style={styles.courseIcon}>
          <Ionicons name="book-outline" size={24} color="#6D28D9" />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course?.title}</Text>
          <Text style={styles.courseDesc} numberOfLines={2}>{course?.description}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

 




  // --- MAIN RENDER ---

  {
    
      if (ClassDetails === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

    
  }


  {
    
      return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={Courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item._id.toString()}
        // The Magic Part:
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={ClassDetails === undefined ? <ActivityIndicator size="small" color="#8B5CF6" /> : <EmptyState />}
        // Performance Settings:
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        // Optimization: renders a bit ahead of the scroll
        removeClippedSubviews={true} 
      />
    </View>
  );
    
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  classTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  classDesc: { fontSize: 16, color: '#E0D4FF', textAlign: 'center', marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  statCard: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 16, alignItems: 'center', minWidth: 100 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 14, color: '#E0D4FF', marginTop: 4 },
  actionsGrid: { flexDirection: 'row', padding: 20, gap: 16, justifyContent: 'center' },
  actionCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', width: '45%', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  actionText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  courseIcon: { backgroundColor: '#EDE9FE', borderRadius: 999, padding: 12, marginRight: 16 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', textAlign: 'right' },
  courseDesc: { fontSize: 14, color: '#6B7280', marginTop: 4, textAlign: 'right' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 20, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16 },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: '#4B5563' },
  emptyStateSubText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});

export default ClassroomContent;