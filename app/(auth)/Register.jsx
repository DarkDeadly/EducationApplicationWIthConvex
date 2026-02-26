// app/(auth)/Register.js
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, useTransition } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSignUp } from '@clerk/clerk-expo';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { api } from "../../convex/_generated/api";
import { userSchema } from '../../src/features/Authentication/api/Schema/user';
import RegisterFooter from '../../src/features/Authentication/components/Register/RegisterFooter';
import RegisterForm from '../../src/features/Authentication/components/Register/RegisterForm';
import RegisterHeader from '../../src/features/Authentication/components/Register/RegisterHeader';

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [AuthError, setAuthError] = useState("")
  const [isPending, startTransition] = useTransition();
  
  // ========================================
  // STATE
  // ========================================
  const form = useForm({
    resolver : yupResolver(userSchema),
    defaultValues : {
        fullname : "",
        email : "",
        password : ""
    }
  })

  const createdUserConvex = useMutation(api.users.CreateUser)
  const {isLoaded , signUp , setActive} = useSignUp()

  // ========================================
  // HANDLERS
  // ========================================

  const onSubmit = () => {
    setAuthError("");
    startTransition(async() => {
         if (!isLoaded) return;
         try {
           const signUpAttempt =  await signUp.create({
                emailAddress : form.getValues("email"),
                password : form.getValues("password"),
                firstName : form.getValues("fullname")
            })
            if (signUpAttempt.status === "complete") {
                await setActive({session : signUpAttempt.createdSessionId})
                await createdUserConvex({
                    clerkId : signUpAttempt.createdUserId,
                    fullname : form.getValues("fullname"),
                    email : form.getValues("email"),
                    role : "pupil",
                    pointBalance : 0
                    
                })
               
            }
         } catch (error) {
            const code = error.errors?.[0]?.code;

          if (code === "form_identifier_exists") {
              setAuthError("هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.");
          } else if (code === "password_too_short") {
              setAuthError("كلمة المرور قصيرة جداً.");
          } else {
              setAuthError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
          }
         }
    })
   
  }

  const navigateToLogin = useCallback(() => {
    router.push('/(auth)/Login');
  }, [router]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  // ========================================
  // RENDER
  // ========================================
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/anime-train-station-with-vending-machine-sunlight.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "transparent", 
            "rgba(0,0,0,0.4)", 
            "rgba(0,0,0,0.8)", 
            "#000000"
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={insets.top}
              style={styles.keyboardView}
              enabled
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                bounces={false}
              >
                
                {/* Header */}
                <RegisterHeader />

                {/* Form */}
               
                <RegisterForm 
                control={form.control} 
                onSubmit={form.handleSubmit(onSubmit)}
                isLoading={isPending}
                errors={form.formState.errors}
                ServerError={AuthError}
                />
                {/* Footer */}
                <RegisterFooter 
                  onNavigateToLogin={navigateToLogin}
                  onNavigateBack={navigateBack}
                />

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// ========================================
// STYLES
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent:"center"
  },
});