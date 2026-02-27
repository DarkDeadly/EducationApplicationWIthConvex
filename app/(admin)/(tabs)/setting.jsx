import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../../convex/_generated/api';

const UserManagement = () => {
  // Data Fetching
  const users = useQuery(api.users.getAllUsers);
  const updateRole = useMutation(api.users.promoteUser);
  
  const [processingId, setProcessingId] = useState(null);

  // Role Styling Helper
  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin':
        return { bg: '#fee2e2', text: '#ef4444', label: 'مدير' };
      case 'teacher':
        return { bg: '#e0e7ff', text: '#6366f1', label: 'معلم' };
      default:
        return { bg: '#f0fdf4', text: '#22c55e', label: 'تلميذ' };
    }
  };

  // The Change Role Function
  const handleChangeRole = (user) => {
    const roles = [
      { label: 'مدير ', value: 'admin' },
      { label: 'معلم ', value: 'teacher' },
      { label: 'تلميذ ', value: 'pupil' },
    ];

    Alert.alert(
      "تعديل الصلاحيات",
      `اختر الرتبة الجديدة للمستخدم: ${user.fullname}`,
      [
        ...roles.map((role) => ({
          text: role.label,
          onPress: async () => {
            try {
              setProcessingId(user._id);
              await updateRole({ userId: user._id, role: role.value });
              // Simple success feedback
            } catch (error) {
              Alert.alert("خطأ", "فشلت العملية. تأكد من أنك تملك صلاحيات مدير.");
            } finally {
              setProcessingId(null);
            }
          },
        })),
        { text: "إلغاء", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const renderUserItem = ({ item }) => {
    const roleStyle = getRoleStyle(item.role);
    const isUpdating = processingId === item._id;

    return (
      <View style={styles.userCard}>
        {/* User Info Section */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.fullname ? item.fullname.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.fullname}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        {/* Action & Badge Section */}
        <View style={styles.actionRow}>
          <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
            <Text style={[styles.roleText, { color: roleStyle.text }]}>
              {roleStyle.label}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleChangeRole(item)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Ionicons name="shield-checkmark-outline" size={20} color="#6366f1" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة المستخدمين</Text>
        <Text style={styles.headerSub}>التحكم في رتب وصلاحيات الأعضاء</Text>
      </View>

      {/* Main Content */}
      {users === undefined ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={60} color="#cbd5e1" />
          <Text style={styles.emptyText}>لا يوجد مستخدمين حالياً</Text>
        </View>
      ) : (
        <FlashList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          estimatedItemSize={90}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

export default UserManagement;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  headerSub: { fontSize: 15, color: '#64748b', marginTop: 4 },

  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  userInfo: { flexDirection: 'row-reverse', alignItems: 'center', flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#6366f1' },

  detailsContainer: { alignItems: 'flex-end', flex: 1, paddingLeft: 10 },
  userName: { fontSize: 16, fontWeight: '700', color: '#334155' },
  userEmail: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  actionRow: { alignItems: 'center', minWidth: 70 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  roleText: { fontSize: 11, fontWeight: '800' },
  editButton: {
    padding: 8,
    backgroundColor: '#f5f7ff',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
});