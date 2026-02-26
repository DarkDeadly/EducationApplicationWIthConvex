import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTransition } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";

import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'convex/react';
import { Controller, useForm } from 'react-hook-form';
import { api } from "../../convex/_generated/api";
import { createClassroomSchema } from '../../src/features/classAddition/api/Schema/classes';
import InputField from '../../src/shared-features/components/Input';

const ClassAddModal = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm({
    resolver: yupResolver(createClassroomSchema),
    defaultValues: {
      name: "",
      pin: ""
    }
  })
  const newClass = useMutation(api.classrooms.classroomCreation)

  const handleCreation = (data) => {
    startTransition(async() => {
      try {
        await newClass({
          name : form.getValues("name"),
          pin : form.getValues("pin"),
          
        })
        router.back();
      } catch (error) {
        
      }
    })
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.headerBackground}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="close-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>إنشاء فصل جديد</Text>
            <View style={styles.spacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(600)} style={styles.formContainer}>
            <Text style={styles.sectionLabel}>المعلومات الأساسية</Text>
            <Controller control={form.control}
              name='name'
              key="name"
              render={({ field: { value, onChange } }) => (
                <InputField
                  placeholder="مثال: رياضيات القسم الخامس"
                  value={value}
                  onChangeText={onChange}
                  error={form.formState.errors.name}
                  icon="book-outline"
                  variant="light"
                />
              )}
            ></Controller>

            <View style={styles.pinSection}>
              <Text style={styles.sectionLabel}>رمز الدخول (PIN)</Text>
              <Text style={styles.sectionDescription}>
                سيستخدم الطلاب هذا الرمز المكون من 4 أرقام للدخول إلى هذا القسم.
              </Text>
              <Controller control={form.control} 
                name = "pin"
                key={"pin"}
                render={({ field: { value, onChange } }) => (
                  <InputField
                placeholder="1 2 3 4"
                value={value}
                onChangeText={onChange}
                error={form.formState.errors.pin}
                icon="lock-closed-outline"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={true}
                variant="light"
              />
                )}></Controller>
            </View>
  
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.mainButton, (isPending) && styles.disabledButton]}
              onPress={() => handleCreation(form.getValues())}
              disabled={ isPending}
            >
              <LinearGradient
                colors={isPending ? ['#CBD5E1', '#94A3B8'] : ['#8B5CF6', '#6D28D9']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isPending ? 'جاري الإنشاء...' : 'تأكيد إنشاء القسم'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flexOne: { flex: 1 },
  headerBackground: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: { width: 40 },
  scrollContent: { padding: 24 },
  formContainer: { marginTop: 10 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'right',
    marginBottom: 8,
    marginTop: 20,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 18,
  },
  pinSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mainButton: {
    marginTop: 40,
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ClassAddModal;