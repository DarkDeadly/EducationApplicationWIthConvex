import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { api } from '../../../../../../convex/_generated/api';

const MaterialsList = () => {
  const { id, courseId } = useLocalSearchParams();
  const router = useRouter();
  const [playingId, setPlayingId] = useState(null);

  // Data Fetching
  const getMaterials = useQuery(api.material.getCourseMaterials, { courseId });
  const getclassData = useQuery(api.courses.getCoursebyId, { courseId: courseId });
    console.log("getclassData : " , getclassData)
  // Audio Player Setup
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const formatSize = (bytes) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const playPauseSound = (item) => {
    // Note: Ensure your Convex query or a separate helper provides the actual file URL
    // storageId needs to be converted to a URL via useQuery(api.material.getURL, {storageId}) 
    // or handled in your backend query.
    
    const fileUrl = item.fileUrl; // Assuming your query returns the accessible URL

    if (playingId === item._id) {
      status.playing ? player.pause() : player.play();
    } else {
      setPlayingId(item._id);
      player.replace({ uri: fileUrl });
      player.play();
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentlyPlaying = playingId === item._id;
    
    return (
      <View>
        <TouchableOpacity 
          style={[styles.materialCard, isCurrentlyPlaying && styles.activeCard]} 
          onPress={() => playPauseSound(item)}
        >
          <View style={styles.iconCircle}>
            <Ionicons 
              name={isCurrentlyPlaying && status.playing ? "pause" : "play"} 
              size={20} 
              color="#6366f1" 
            />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.materialTitle}>{item.title}</Text>
            <Text style={styles.materialMeta}>
              {formatSize(item.fileSize)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Progress Bar for the active item */}
        {isCurrentlyPlaying && (
          <View style={styles.miniProgressContainer}>
            <View 
              style={[
                styles.miniProgressBar, 
                { width: `${(status.currentTime / status.duration) * 100}%` }
              ]} 
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      {/* Header Section: Name and Description */}
      <View style={styles.headerSection}>
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push(`(teacher)/(tabs)/classes/${id}/${courseId}/MaterialAdd`)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>المحتوى الدراسي</Text>
        </View>

        {getclassData === undefined ? (
          <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
        ) : (
          
          <View style={styles.courseDetails}>
            <Text style={styles.courseTitleText}>{getclassData?.title}</Text>
            <Text style={styles.courseDescText}>{getclassData?.description}</Text>
          </View>
        )}
      </View>

      {/* Materials List */}
      {getMaterials === undefined ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : getMaterials.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-upload-outline" size={60} color="rgba(255,255,255,0.1)" />
          <Text style={styles.emptyText}>لا توجد ملفات مرفوعة حالياً</Text>
        </View>
      ) : (
        <FlatList
          data={getMaterials}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </LinearGradient>
  );
};

export default MaterialsList;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#94a3b8' },
  courseDetails: { 
    alignItems: 'flex-end',
    width: '100%', // Ensure it takes full width to allow wrapping
    paddingLeft: 10, // Add a little breathing room on the left
  },
  courseTitleText: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#fff', 
    marginBottom: 5,
    textAlign: 'right', // Explicitly align text right
    flexShrink: 1, // Allow text to shrink/wrap instead of overflowing
  },
  courseDescText: { 
    fontSize: 16, 
    color: '#94a3b8', 
    textAlign: 'right', 
    lineHeight: 22,
    flexShrink: 1,
  },
  
  addButton: { 
    backgroundColor: '#6366f1', 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748b', marginTop: 10, fontSize: 16 },
  listContent: { padding: 20 },
  materialCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    marginBottom: 12,
  },
  activeCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
    borderWidth: 1,
  },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 15
  },
  infoContainer: { flex: 1, alignItems: 'flex-end' },
  materialTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  materialMeta: { color: '#64748b', fontSize: 13, marginTop: 4 },
  
  miniProgressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: -20,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden'
  },
  miniProgressBar: {
    height: '100%',
    backgroundColor: '#6366f1'
  }
});