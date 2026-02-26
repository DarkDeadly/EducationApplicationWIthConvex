import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../../../convex/_generated/api';

const ClassDetails = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { classid } = useLocalSearchParams();
  const ClassDetails = useQuery(api.classrooms.getClassById , {
    classId : classid
  })
  const Courses = useQuery(api.courses.getClassCourses , {
    classroomId : classid
  })


   
     const RenderHeader = () => (
        <View style={styles.headerWrapper}>
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.header}>
               
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back-sharp" size={24} color="#fff" />
                </TouchableOpacity>

                <Animated.Text entering={FadeInRight.delay(200)} style={styles.classTitle}>
                    {ClassDetails?.name}
                </Animated.Text>


                <View style={styles.statsRow}>
                    <View style={styles.statBadge}>
                        <Text style={styles.statText}>{Courses?.length} دروس متاحة</Text>
                        <Ionicons name="library" size={14} color="#fff" />
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>محتوى الدورة</Text>
                <View style={styles.activeIndicator} />
            </View>
        </View>
     )

  
      const RenderCourseItem = ({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).duration(500)}>
            <TouchableOpacity
                style={styles.courseCard}
                activeOpacity={0.7}
                onPress={() => router.push(`(pupil)/(tabs)/class/${classid}/${item._id}`)}
            >
                <View style={styles.courseIcon}>
                    <Ionicons name="play" size={22} color="#8B5CF6" />
                </View>

                <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{item?.title}</Text>
                    <Text style={styles.courseDesc} numberOfLines={1}>
                        {item?.description || "لا يوجد وصف متوفر لهذا الدرس"}
                    </Text>
                </View>


            </TouchableOpacity>
        </Animated.View>
    );
    

    // FIX: Added loading state
    if (ClassDetails === undefined) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>جاري تحضير الدروس...</Text>
            </View>
        );
    }



    return (
      
       
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <FlashList
                data={Courses}
                renderItem={RenderCourseItem}
                keyExtractor={(item) => item._id.toString()}
                ListHeaderComponent={RenderHeader}
                ListEmptyComponent={Courses === undefined ? null : <RenderEmpty />}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            />
        </View>
        
    );
};

const RenderEmpty = () => (
    <View style={styles.emptyState}>
        <View style={styles.emptyIconCircle}>
            <Ionicons name="document-text-outline" size={40} color="#94A3B8" />
        </View>
        <Text style={styles.emptyStateText}>القسم فارغ حالياً</Text>
        <Text style={styles.emptyStateSubText}>سوف تظهر الدروس والملفات هنا بمجرد أن يرفعها المعلم</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerWrapper: { marginBottom: 10 },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 35,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backButton: {
        alignSelf: 'flex-start',
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    classTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'right' },
    classDesc: { fontSize: 14, color: '#E0D4FF', textAlign: 'right', marginTop: 8, opacity: 0.9, lineHeight: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 12
    },
    statText: { color: '#fff', marginRight: 8, fontSize: 13, fontWeight: '700' },
    sectionHeader: {
        paddingHorizontal: 25,
        paddingTop: 25,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    activeIndicator: { width: 40, height: 4, backgroundColor: '#8B5CF6', borderRadius: 2, marginTop: 4, alignSelf: 'flex-end' },
    courseCard: {
        flexDirection: 'row-reverse',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 22,
        padding: 14,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
    },
    courseIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#F5F3FF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
    courseInfo: { flex: 1, justifyContent: 'center' },
    courseTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', textAlign: 'right' },
    courseDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'right' },
    arrowContainer: { paddingRight: 5 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#8B5CF6', fontWeight: '600' },
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
    emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 50 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyStateText: { fontSize: 18, fontWeight: '800', color: '#475569' },
    emptyStateSubText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

export default ClassDetails;