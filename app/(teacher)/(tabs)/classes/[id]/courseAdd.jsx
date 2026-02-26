import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../../../../convex/_generated/api";
import { courseSchema } from "../../../../../src/features/courseFeature/api/Schema";

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function AddCourseScreen() {
    const insets = useSafeAreaInsets();
    const [isPending, startTransition] = useTransition()
    const router = useRouter();
    const { id: classroomId } = useLocalSearchParams();

    const form = useForm({
        resolver: yupResolver(courseSchema),
        defaultValues: {
            title: "",
            description: ""
        }
    })

    const courseAddition = useMutation(api.courses.courseCreation)


    const handleCreateCourse = () => {
        startTransition(async() => {
            try {
             await courseAddition({
                title : form.getValues("title"),
                description : form.getValues("description"),
                isActive : true, 
                 classroomId : classroomId            
             })   
             form.resetField()
             router.back()
            } catch (error) {
               console.log(error) 
            }
        })
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <LinearGradient
                colors={["#EEF2FF", "#F6F7FB", "#FFFFFF"]}
                style={{ flex: 1 }}
            >
                <View
                    style={[
                        styles.container,
                        {
                            paddingTop: insets.top + 16,
                            paddingBottom: insets.bottom + 16,
                        },
                    ]}
                >
                    <AnimatedText
                        entering={FadeInUp.delay(200).duration(500)}
                        style={styles.title}
                    >
                        إضافة دورة
                    </AnimatedText>
                    <AnimatedText
                        entering={FadeInUp.delay(300).duration(500)}
                        style={styles.subtitle}
                    >
                        أنشئ دورة جديدة لقسمك الدراسي
                    </AnimatedText>

                    <AnimatedView
                        entering={FadeInUp.delay(400).duration(500)}
                        style={styles.card}
                    >
                        <Text style={styles.label}>عنوان الدورة</Text>
                        <Controller
                            key={"title"}
                            name="title"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder="مثال: أساسيات الجبر"
                                        placeholderTextColor="#9CA3AF"
                                        style={[
                                            styles.input,
                                            // If there is an error, apply the red background and border
                                            form.formState.errors.title && styles.inputError
                                        ]}
                                        textAlign="right"

                                    />
                                    {form.formState.errors.title && (
                                        <Text style={styles.errorText}>
                                            {form.formState.errors.title.message}
                                        </Text>
                                    )}
                                </>

                            )}
                        />




                        <Text style={styles.label}>الوصف</Text>
                        <Controller
                            key={"description"}
                            name="description"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                                <>
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder="اكتب وصفًا مختصرًا عن محتوى الدورة"
                                        placeholderTextColor="#9CA3AF"
                                        style={[styles.input, styles.textArea,  form.formState.errors.title && styles.inputError]}
                                        multiline
                                        numberOfLines={4}
                                        textAlign="right"
                                    />
                                    {form.formState.errors.description && (
                                        <Text style={styles.errorText}>
                                            {form.formState.errors.description.message}
                                        </Text>
                                    )}
                                </>
                            )}
                        />

                        <TouchableOpacity
                            activeOpacity={0.85}
                            disabled={isPending}
                            onPress={form.handleSubmit(handleCreateCourse)}
                            style={{ marginTop: 24 }}
                        >
                            <LinearGradient
                                colors={
                                    isPending
                                        ? ["#9CA3AF", "#9CA3AF"]
                                        : ["#2563EB", "#4F46E5"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>
                                    {isPending ? "جارٍ الإنشاء..." : "إنشاء الدورة"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </AnimatedView>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        justifyContent: "center"
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111827",
        textAlign: "right",
    },

    subtitle: {
        marginTop: 4,
        marginBottom: 24,
        fontSize: 15,
        color: "#6B7280",
        textAlign: "right",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
        marginTop: 12,
        textAlign: "right",
    },

    input: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#111827",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    inputError: {
        backgroundColor: "#FEF2F2", // Light red background area
        borderColor: "#EF4444",     // Red border
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },

    gradientButton: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    errorInput: {
        borderColor: "#EF4444", // Red border
        backgroundColor: "#FEF2F2", // Very light red background
    },
    errorText: {
        color: "#EF4444",
        fontSize: 12,
        textAlign: "right",
        marginTop: 4,
        fontWeight: "600",
    }
});