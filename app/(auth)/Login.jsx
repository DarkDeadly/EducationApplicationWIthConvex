import { useSignIn } from '@clerk/clerk-expo'
import { yupResolver } from '@hookform/resolvers/yup'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { loginSchema } from '../../src/features/Authentication/api/Schema/user'
import LoginFooter from '../../src/features/Authentication/components/Login/LoginFooter'
import LoginForm from '../../src/features/Authentication/components/Login/LoginForm'
import LoginHeader from '../../src/features/Authentication/components/Login/LoginHeader'

const Login = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authError, setAuthError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {isLoaded , setActive , signIn} = useSignIn()

  const form = useForm({
    resolver : yupResolver(loginSchema),
    defaultValues : {
        email : "",
        password : ""
    }
  })

  const LoginHandler = () => {
    startTransition(async() => {
      try {
          const signinAttempt = await signIn.create({
            identifier : form.getValues("email"),
            password : form.getValues("password")
        })
        if (signinAttempt.status === "complete") {
            await setActive({session : signinAttempt.createdSessionId})
            console.log("Login successful, session activated.");
        }
      } catch (err) {
        const code = err.errors?.[0]?.code;

      // 2. Set your custom messages
      if (code === "form_password_incorrect" || code === "form_identifier_not_found") {
        setAuthError("بيانات الدخول غير صحيحة" );
      } else if (code === "too_many_attempts") {
        setAuthError("تم قفل الحساب بسبب محاولات تسجيل دخول كثيرة. يرجى المحاولة لاحقًا.");
      } else {
        setAuthError("An unexpected error occurred.");
      }
      }
    });
  }


   const navigateToRegister = useCallback(() => {
    router.push('/(auth)/Register');
  }, [router]);
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
            "rgba(0,0,0,0.3)", 
            "rgba(0,0,0,0.7)", 
            "#000000"
          ]}
          locations={[0, 0.2, 0.6, 1]}
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
                <LoginHeader />

                {/* Form */}
                <LoginForm 
                control={form.control} 
                onSubmit={form.handleSubmit(LoginHandler)} 
                isLoading={isPending} 
                errors={form.formState.errors}
                ServerError={authError}
                />

                {/* Footer */}
                <LoginFooter 
                  onNavigateToRegister={navigateToRegister}
                />

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
   )
  
}

export default Login

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
    paddingTop: 112, // mt-28 equivalent
    paddingBottom: 48, // py-12 equivalent
  },
});