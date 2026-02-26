import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../../convex/_generated/api';

const GRADIENT_PALETTE = [
  ['#8B5CF6', '#6D28D9'], // Violet
  ['#3B82F6', '#1D4ED8'], // Blue
  ['#EC4899', '#BE185D'], // Pink
  ['#10B981', '#047857'], // Emerald
];

const ClassCard = ({ item, index, userClassroom }) => {
  const cardColors = GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];
  const isJoined = item._id === userClassroom;
  const router = useRouter();

  const handlePress = () => {
    if (isJoined) {
      router.push(`(pupil)/(tabs)/rewards/${item._id}`);
    } else {
     Alert.alert("لست منضما في هذا القسم")
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      
    >
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress}
        style={styles.cardWrapper}
      >
        <LinearGradient
          colors={cardColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Top Row: Status and Icon */}
          <View style={styles.cardHeader}>
            {isJoined ? (
              <View style={styles.statusBadgeActive}>
                <Ionicons name="enter-outline" size={14} color="#FFF" />
                <Text style={styles.statusText}>دخول الفصل</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeEmpty}>
                <Text style={styles.statusText}>غير منضم</Text>
              </View>
            )}
            <View style={styles.glassIconContainer}>
              <Ionicons name="school" size={24} color="#FFF" />
            </View>
          </View>

          {/* Bottom Row: Info (RTL Flow) */}
          <View style={styles.infoSection}>
             <Text style={styles.className} numberOfLines={1}>{item?.name}</Text>
             <View style={styles.teacherRow}>
                <Text style={styles.teacherName}>{item?.teacherName || 'معلم الفصل'}</Text>
                <Ionicons name="person-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
             </View>
          </View>

          {/* Decorative Subtle Pattern */}
          <View style={styles.decorCircle} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ClassSelectionScreen = () => {
  const insets = useSafeAreaInsets();
  const classrooms = useQuery(api.classrooms.getClassroom);
  const user = useQuery(api.users.getUserByClerkId);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#4C1D95', '#8B5CF6']}
          style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        >
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={styles.headerTitle}>اختر فصلك الدراسي</Text>
            <Text style={styles.headerSubtitle}>
              ابدأ رحلتك التعليمية الآن، اجمع النقاط واستبدلها بمكافآت مذهلة
            </Text>
          </Animated.View>
          <View style={styles.accentCircle} />
        </LinearGradient>
      </View>

      <FlatList
        data={classrooms}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <ClassCard 
            item={item} 
            index={index} 
            userClassroom={user?.classroomId}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          classrooms !== undefined && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>لا توجد فصول دراسية متاحة</Text>
            </View>
          )
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#6D28D9',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#EDE9FE',
    textAlign: 'right',
    marginTop: 8,
    lineHeight: 22,
  },
  accentCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    left: -30,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 28,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGradient: {
    padding: 22,
    borderRadius: 28,
    height: 155,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusBadgeActive: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeEmpty: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 4,
  },
  infoSection: {
    alignItems: 'flex-end',
  },
  className: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherName: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
  },
  decorCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -30,
    right: -20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default ClassSelectionScreen;