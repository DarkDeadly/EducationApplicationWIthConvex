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
    View,
} from 'react-native';
import { api } from '../../../../../../convex/_generated/api';

const MaterialsList = () => {
  const { classid, courseid } = useLocalSearchParams();
  const router = useRouter();
  const [playingId, setPlayingId] = useState(null);

  // Data Fetching
  const getMaterials = useQuery(api.material.getCourseMaterials, { courseId :courseid });
  const getclassData = useQuery(api.courses.getCoursebyId, { courseId : courseid });

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const playPauseSound = (item) => {
    const fileUrl = item.fileUrl; // ← make sure this is a direct playable URL

    if (playingId === item._id) {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } else {
      setPlayingId(item._id);
      player.replace({ uri: fileUrl });
      player.play();
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentlyPlaying = playingId === item._id;
    const isPlaying = isCurrentlyPlaying && status.playing;

    return (
      <View style={styles.itemWrapper}>
        <TouchableOpacity
          style={[styles.materialCard, isCurrentlyPlaying && styles.activeCard]}
          onPress={() => playPauseSound(item)}
          activeOpacity={0.88}
        >
          <View style={[styles.playButton, isPlaying && styles.playing]}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#ffffff"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.materialTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.materialMeta}>
              {formatSize(item.fileSize)} • صوت
            </Text>
          </View>
        </TouchableOpacity>

        {isCurrentlyPlaying && status.duration > 0 && (
          <View style={styles.progressWrapper}>
            <View
              style={[
                styles.progressBar,
                {
                  width: status.duration
                    ? `${(status.currentTime / status.duration) * 100}%`
                    : '0%',
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#f8fafc', '#f1f5f9']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
      

          <Text style={styles.screenTitle}>المواد الدراسية</Text>
       

        {getclassData === undefined ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{getclassData?.title}</Text>
            {getclassData?.description && (
              <Text style={styles.courseDesc}>{getclassData.description}</Text>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      {getMaterials === undefined ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : getMaterials.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={72} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا توجد مواد مرفوعة بعد</Text>
          <Text style={styles.emptySubText}>
            اضغط على زر "+" لإضافة ملف صوتي جديد
          </Text>
        </View>
      ) : (
        <FlatList
          data={getMaterials}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

export default MaterialsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    textAlign:"right"
  },



  courseInfo: {
    alignItems: 'flex-end',
  },

  courseName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'right',
    lineHeight: 32,
  },

  courseDesc: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 8,
    lineHeight: 24,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  itemWrapper: {
    marginBottom: 16,
  },

  materialCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  activeCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },

  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },

  playing: {
    backgroundColor: '#1d4ed8',
  },

  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },

  materialTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'right',
    lineHeight: 24,
  },

  materialMeta: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  progressWrapper: {
    height: 4,
    backgroundColor: '#e2e8f0',
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },

  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 20,
    textAlign: 'center',
  },

  emptySubText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
});