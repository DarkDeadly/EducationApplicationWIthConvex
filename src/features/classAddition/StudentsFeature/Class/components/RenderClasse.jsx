import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../../../../../convex/_generated/api';
import { ClassEntrySchema } from '../api/Schema';

const RenderClasse = ({ item }) => {
    const form = useForm({
        resolver : yupResolver(ClassEntrySchema),
        defaultValues: {
            pin : ""
        }
    })
    const [isPending, startTransition] = useTransition()
    const JoinFunction = useMutation(api.classrooms.joinClass)
    const user = useQuery(api.users.getUserByClerkId)
    const router = useRouter();



    const Submit = () => {
        startTransition(async() => {
            try {
              await JoinFunction({
                classroomId : item?._id,
                pin : form.getValues("pin")
              })  
              router.push(`(pupil)/(tabs)/class/${item?._id}`)
            } catch (error) {
               console.log(error.message) 
            }
        })
    }


    // FIX: Validate item exists
    if (!item || !item._id) {
        return null;
    }

    const isJoined = user?.classroomId == item._id;

    return (
        <View style={styles.classCard}>
            <View style={styles.cardContent}>
                {/* Header: Name and Status */}
                <View style={styles.headerRow}>
                    <View style={[styles.statusBadge, item?.isActive ? styles.active : styles.inactive]}>
                        <Text style={[styles.statusText, item?.isActive ? styles.activeText : styles.inactiveText]}>
                            {item?.isActive ? 'نشط' : 'مغلق'}
                        </Text>
                    </View>
                    <Text style={styles.className}>{item?.name}</Text>
                </View>

                {/* Teacher & Date Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoText}>{item?.teacherName}</Text>
                        <Ionicons name="person-circle-outline" size={16} color="#8B5CF6" />
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoText}>
                            {new Date(item?._creationTime).toLocaleDateString('ar-TN')}
                        </Text>
                        <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                    </View>
                </View>

                {/*(error || serverError) && (
                    <Text style={styles.errorText}>
                        {error || serverError?.response?.data?.message || "خطأ في الرمز"}
                    </Text>
                ) */}

                {/* Conditional Action Area */}
                <View style={styles.actionsContainer}>
                    {isJoined ? (
                        <TouchableOpacity
                            style={styles.joinButton}
                            onPress={() => router.push(`(pupil)/(tabs)/class/${item?._id}`)}
                        >
                            <Text style={styles.joinedButtonText}>دخول القسم</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.joinRow}>
                            <TouchableOpacity
                                style={[styles.joinButton , (isPending) && { opacity: 0.7 }]}
                                onPress={form.handleSubmit(Submit)}
                            >
                                <Text style={styles.joinButtonText}>
                                    {isPending ? 'جاري الانضمام...'  : 'انضمام'}
                                </Text>
                            </TouchableOpacity>
                            <Controller 
                            key={"pin"}
                            name='pin'
                            control={form.control}
                            render={({field : {onChange , value}}) => (
                                <TextInput
                                style={[styles.pinInput, form.formState.errors.pin && styles.inputError]}
                                placeholder="الرمز السري"
                                placeholderTextColor="#CBD5E1"
                                keyboardType="number-pad"
                                value={value}
                                onChangeText={onChange}
                                maxLength={4}
                                secureTextEntry
                                textAlign="center"
                            />
                            )}
                            />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default RenderClasse;

const styles = StyleSheet.create({
    classCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: { shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: { elevation: 4 }
        })
    },
    cardContent: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    className: { fontSize: 18, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right', marginRight: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    active: { backgroundColor: '#F0FDF4' },
    inactive: { backgroundColor: '#FEF2F2' },
    statusText: { fontSize: 11, fontWeight: '700' },
    activeText: { color: '#16A34A' },
    inactiveText: { color: '#DC2626' },
    infoRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginBottom: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    description: { fontSize: 14, color: '#64748B', textAlign: 'right', marginBottom: 20, lineHeight: 20 },
    actionsContainer: { marginTop: 5 },
    joinRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    pinInput: {
        flex: 1,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B'
    },
    inputError: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
    joinButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 25,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    joinButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    joinedButton: {
        backgroundColor: '#6D28D9',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        gap: 8
    },
    joinedButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    errorText: { color: '#DC2626', fontSize: 12, textAlign: 'right', marginBottom: 8, fontWeight: '600' }
});



