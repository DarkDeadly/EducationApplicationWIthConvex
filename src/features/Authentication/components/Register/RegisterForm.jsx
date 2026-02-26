import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Button from '../../../../shared-features/components/Button';
import InputField from '../../../../shared-features/components/Input';

const formFields = [
  {
    name: 'fullname',
    placeholder: 'أدخل اسمك الكامل',
    icon: 'person-outline',
  },
  {
    name: 'email',
    placeholder: 'example@email.com',
    icon: 'mail-outline',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
   
  },
  {
    name: 'password',
    placeholder: '••••••••',
    icon: 'lock-closed-outline',
    secureTextEntry: true,
  },
];

const RegisterForm = ({ control, onSubmit, isLoading, errors , ServerError }) => {
   
  return (
    <Animated.View entering={FadeInDown.delay(350)} style={styles.form}>
      {formFields.map((field) => (
       <Controller
       key={field.name}
       control={control}
       name={field.name} 
       render={({field:{ onChange , value}}) => (
         <InputField
          key={field.name}
          placeholder={field.placeholder}
          value={value}
          onChangeText={onChange}
          error={errors[field.name]?.message}
          icon={field.icon}
          keyboardType={field.keyboardType}
          autoCapitalize={field.autoCapitalize}
          secureTextEntry={field.secureTextEntry}
         
        />
       )}
       >

       </Controller>
      ))}

    {ServerError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{ServerError}</Text>
                </View>
              )}
      <Button
        title={isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        onPress={onSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.registerButton}
      />
    </Animated.View>
  );
}

export default RegisterForm

const styles = StyleSheet.create({
    form: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 8,
  },
   errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)', // Subtle red tint
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    // Since you used Arabic text in your handler, add writing direction if needed:
    textAlign: 'right', 
  },
})