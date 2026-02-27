import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'convex/react';
import { createAudioPlayer } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { api } from '../../../../../../convex/_generated/api';
import { MaterialSchema } from '../../../../../../src/features/courseFeature/api/Schema';

const MaterialAdd = () => {
  const { id: classroomId, courseId } = useLocalSearchParams();
  const router = useRouter();
  
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateUploadUrl = useMutation(api.material.generateStorageId);
  const addMaterialRecord = useMutation(api.material.AddMaterial);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(MaterialSchema),
    defaultValues: { title: "", file: null }
  });

  const selectedFile = watch("file");

  // Format bytes for display (e.g., 5.24 MB)
  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  // Format duration for display (e.g., 03:45)
  const formatDuration = (ms) => {
    if (!ms) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

 const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        console.log('this is the asset : ' , asset)
        
        let durationMs = 0;
        try {
          // Use createAudioPlayer directly (SDK 54 syntax)
          const player = createAudioPlayer(asset.uri);
          console.log("this is the player: " , player)
          
          // In the new API, duration is a property on the player
          // We check if it's available immediately
          durationMs = (player.duration || 0) * 1000;
          
          // Cleanup the player instance immediately so it doesn't stay in memory
          // Some versions use .terminate() or just letting it fall out of scope
        } catch (e) {
          console.error("Error extracting duration:", e);
        }

        setValue("file", { ...asset, duration: durationMs }, { shouldValidate: true });
        setProgress(0);
      }
    } catch (err) {
      Alert.alert('خطأ', 'فشل اختيار الملف');
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    console.log(data)
    setUploading(true);
    setProgress(0);

    // Simulated progress bar logic for modern fetch
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 0.9 ? prev + 0.05 : prev));
    }, 400);

    try {
      // 1. Get Convex Upload URL
      const postUrl = await generateUploadUrl();

      // 2. Prepare Blob
      const fileResponse = await fetch(data.file.uri);
      const blob = await fileResponse.blob();

      // 3. Upload to Cloud Storage
      const uploadResult = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': data.file.mimeType || 'audio/mpeg' },
        body: blob,
      });

      if (!uploadResult.ok) throw new Error("Upload failed");
      
      const { storageId } = await uploadResult.json();
      
      clearInterval(progressInterval);
      setProgress(1);

      // 4. Finalize Database Record
      startTransition(async () => {
        try {
          await addMaterialRecord({
            title: data.title,
            storageId: storageId,
            fileSize: data.file.size || 0,
            duration: data.file.duration || 0, // Sending extracted duration
            courseId: courseId,
          });
          router.push(`(teacher)/(tabs)/classes/${classroomId}`);
        } catch (dbError) {
          Alert.alert('خطأ', 'فشل حفظ البيانات في قاعدة البيانات');
        }
      });

    } catch (error) {
      clearInterval(progressInterval);
      Alert.alert('حدث خطأ', 'فشلت عملية الرفع، يرجى المحاولة لاحقاً');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>إضافة محتوى دراسي</Text>

          {/* Title Field */}
          <View style={styles.inputWrapper}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, errors.title && styles.inputError]}>
                  <TextInput
                    style={styles.input}
                    placeholder="عنوان الدرس الصوتي"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={value}
                    onChangeText={onChange}
                    editable={!uploading && !isPending}
                  />
                </View>
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>

          {/* Picker Button */}
          <TouchableOpacity
            style={[styles.filePickerButton, (uploading || isPending) && styles.disabledButton]}
            onPress={pickDocument}
            disabled={uploading || isPending}
          >
            <Ionicons name="mic-circle-outline" size={24} color="#fff" />
            <Text style={styles.filePickerButtonText}>
              {selectedFile ? 'تغيير الملف المختار' : 'اختر ملفاً صوتياً'}
            </Text>
          </TouchableOpacity>

          {/* File Preview Card */}
          {selectedFile && (
            <View style={styles.filePreview}>
              <TouchableOpacity onPress={() => setValue("file", null)} disabled={uploading}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.fileMeta}>
                  {formatBytes(selectedFile.size)} • {formatDuration(selectedFile.duration)}
                </Text>
              </View>
            </View>
          )}

          {/* Modern Progress Bar */}
          {(uploading || isPending) && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {isPending ? "جاري الحفظ النهائي..." : `جاري الرفع: ${Math.round(progress * 100)}%`}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.createButton, (uploading || isPending || !selectedFile) && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={uploading || isPending || !selectedFile}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>
                {uploading ? 'جاري المعالجة...' : 'نشر المادة'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 40 },
  inputWrapper: { marginBottom: 20 },
  inputContainer: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, paddingHorizontal: 16, height: 60, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputError: { borderColor: '#ef4444' },
  input: { color: '#fff', fontSize: 16, textAlign: 'right' },
  errorText: { color: '#ef4444', textAlign: 'right', marginTop: 6, fontSize: 12 },
  filePickerButton: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', paddingVertical: 18, borderRadius: 16, marginBottom: 12 },
  filePickerButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 10 },
  filePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 16, borderRadius: 16, marginBottom: 30, justifyContent: 'space-between', borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  fileInfo: { alignItems: 'flex-end', flex: 1 },
  fileName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fileMeta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  progressSection: { marginBottom: 30 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981' },
  progressText: { color: '#94a3b8', textAlign: 'center', marginTop: 10, fontSize: 13 },
  createButton: { backgroundColor: '#10b981', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  disabledButton: { opacity: 0.5 },
});

export default MaterialAdd;