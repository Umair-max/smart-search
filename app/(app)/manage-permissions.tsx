import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ScreenComponent from "@/components/ScreenComponent";
import Typo from "@/components/Typo";
import colors from "@/config/colors";
import { radius, spacingX, spacingY } from "@/config/spacing";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserProfile } from "@/services/userManagementService";
import { useAuthStore } from "@/store/authStore";
import { normalizeX, normalizeY } from "@/utils/normalize";

interface UserItemProps {
  user: UserProfile;
  currentUserUid: string;
  onUpdatePermissions: (
    uid: string,
    permissions: { canEdit: boolean; canUpload: boolean; canDelete: boolean }
  ) => void;
  onToggleBlock: (uid: string, isBlocked: boolean) => void;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  currentUserUid,
  onUpdatePermissions,
  onToggleBlock,
}) => {
  const isCurrentUser = user.uid === currentUserUid;
  const isAdmin = user.role === "admin";

  const handleEditPermissionToggle = (value: boolean) => {
    onUpdatePermissions(user.uid, {
      canEdit: value,
      canUpload: user.permissions.canUpload,
      canDelete: user.permissions.canDelete,
    });
  };

  const handleUploadPermissionToggle = (value: boolean) => {
    onUpdatePermissions(user.uid, {
      canEdit: user.permissions.canEdit,
      canUpload: value,
      canDelete: user.permissions.canDelete,
    });
  };

  const handleDeletePermissionToggle = (value: boolean) => {
    onUpdatePermissions(user.uid, {
      canEdit: user.permissions.canEdit,
      canUpload: user.permissions.canUpload,
      canDelete: value,
    });
  };

  const handleBlockToggle = (value: boolean) => {
    if (isCurrentUser) {
      Alert.alert("Error", "You cannot block yourself");
      return;
    }

    if (isAdmin && value) {
      Alert.alert("Error", "You cannot block another admin");
      return;
    }

    Alert.alert(
      value ? "Block User" : "Unblock User",
      `Are you sure you want to ${value ? "block" : "unblock"} ${
        user.displayName || user.email
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: value ? "Block" : "Unblock",
          style: value ? "destructive" : "default",
          onPress: () => onToggleBlock(user.uid, value),
        },
      ]
    );
  };

  return (
    <View style={[styles.userItem, user.isBlocked && styles.blockedUserItem]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Image
            source={
              user.profileImageUrl
                ? { uri: user.profileImageUrl }
                : require("@/assets/images/user.png")
            }
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Typo size={16} style={styles.userName}>
                {user.displayName || user.email.split("@")[0]}
              </Typo>
              {isCurrentUser && (
                <View style={styles.currentUserBadge}>
                  <Typo size={10} style={styles.currentUserText}>
                    YOU
                  </Typo>
                </View>
              )}
            </View>
            <Typo size={14} style={styles.userEmail}>
              {user.email}
            </Typo>
            <View style={styles.roleRow}>
              <View
                style={[
                  styles.roleContainer,
                  {
                    backgroundColor: isAdmin
                      ? colors.primary
                      : colors.lightPurple,
                  },
                ]}
              >
                <Typo
                  size={12}
                  style={[
                    styles.roleText,
                    { color: isAdmin ? colors.white : colors.purple },
                  ]}
                >
                  {user.role.toUpperCase()}
                </Typo>
              </View>
              {user.isBlocked && (
                <View style={styles.blockedBadge}>
                  <Ionicons name="ban" size={12} color={colors.white} />
                  <Typo size={10} style={styles.blockedText}>
                    BLOCKED
                  </Typo>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {!isAdmin && (
        <View style={styles.permissionsContainer}>
          <View style={styles.permissionRow}>
            <Typo size={14} style={styles.permissionLabel}>
              Edit Permission
            </Typo>
            <Switch
              value={user.permissions.canEdit}
              onValueChange={handleEditPermissionToggle}
              disabled={user.isBlocked || isCurrentUser}
              trackColor={{
                false: colors.lightGray,
                true: colors.lightPrimary,
              }}
              thumbColor={
                user.permissions.canEdit ? colors.primary : colors.midGray
              }
            />
          </View>

          <View style={styles.permissionRow}>
            <Typo size={14} style={styles.permissionLabel}>
              Upload Permission
            </Typo>
            <Switch
              value={user.permissions.canUpload}
              onValueChange={handleUploadPermissionToggle}
              disabled={user.isBlocked || isCurrentUser}
              trackColor={{
                false: colors.lightGray,
                true: colors.lightPrimary,
              }}
              thumbColor={
                user.permissions.canUpload ? colors.primary : colors.midGray
              }
            />
          </View>

          <View style={styles.permissionRow}>
            <Typo size={14} style={styles.permissionLabel}>
              Delete Permission
            </Typo>
            <Switch
              value={user.permissions.canDelete}
              onValueChange={handleDeletePermissionToggle}
              disabled={user.isBlocked || isCurrentUser}
              trackColor={{
                false: colors.lightGray,
                true: colors.lightPrimary,
              }}
              thumbColor={
                user.permissions.canDelete ? colors.primary : colors.midGray
              }
            />
          </View>

          <View style={styles.permissionRow}>
            <Typo size={14} style={[styles.permissionLabel, styles.blockLabel]}>
              Block User
            </Typo>
            <Switch
              value={user.isBlocked}
              onValueChange={handleBlockToggle}
              disabled={isCurrentUser}
              trackColor={{ false: colors.lightGray, true: colors.lightRed }}
              thumbColor={user.isBlocked ? colors.error : colors.midGray}
            />
          </View>
        </View>
      )}

      {isAdmin && !isCurrentUser && (
        <View style={styles.adminInfo}>
          <Typo size={12} style={styles.adminInfoText}>
            Admin users have full access and cannot be modified
          </Typo>
        </View>
      )}
    </View>
  );
};

export default function ManagePermissionsScreen() {
  const { user: currentUser, isAdmin } = useAuthStore();
  const {
    users,
    loading,
    updateUserPermissions,
    updateUserBlockStatus,
    refreshUsers,
    searchUsers,
  } = useUserManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Get filtered users based on search query and exclude current user
  const filteredUsers = searchUsers(searchQuery, currentUser?.uid);

  useEffect(() => {
    if (!isAdmin()) {
      Alert.alert(
        "Access Denied",
        "You do not have permission to access this screen",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }
    // The useUserManagement hook automatically loads users when needed
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUsers();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUpdatePermissions = async (
    uid: string,
    permissions: { canEdit: boolean; canUpload: boolean; canDelete: boolean }
  ) => {
    try {
      await updateUserPermissions(uid, permissions);
    } catch (error) {
      // Error handling is done in the store
      console.error("Failed to update permissions:", error);
    }
  };

  const handleToggleBlock = async (uid: string, isBlocked: boolean) => {
    try {
      await updateUserBlockStatus(uid, isBlocked);
    } catch (error) {
      // Error handling is done in the store
      console.error("Failed to update block status:", error);
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <UserItem
      user={item}
      currentUserUid={currentUser?.uid || ""}
      onUpdatePermissions={handleUpdatePermissions}
      onToggleBlock={handleToggleBlock}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Typo size={20} style={styles.headerTitle}>
          Manage Permissions
        </Typo>
        <View style={styles.headerRight}>
          <Typo size={14} style={styles.userCount}>
            {filteredUsers.length} users
          </Typo>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textGray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          placeholderTextColor={colors.textGray}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => handleSearch("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.textGray} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (!isAdmin()) {
    return null;
  }

  return (
    <ScreenComponent style={styles.container}>
      {renderHeader()}

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._15,
    backgroundColor: colors.buttonGrey,
    borderRadius: radius._12,
    paddingHorizontal: spacingX._15,
  },
  searchIcon: {
    marginRight: spacingX._10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacingY._12,
    fontSize: 16,
    color: colors.black,
  },
  clearButton: {
    padding: spacingY._5,
  },
  backButton: {
    padding: spacingY._5,
  },
  headerTitle: {
    fontWeight: "600",
    color: colors.black,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  userCount: {
    color: colors.textGray,
    fontWeight: "500",
  },
  listContainer: {
    padding: spacingX._20,
  },
  userItem: {
    backgroundColor: colors.white,
    borderRadius: radius._15,
    padding: spacingX._15,
    marginBottom: spacingY._15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  blockedUserItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    backgroundColor: colors.lightRed,
  },
  userHeader: {
    marginBottom: spacingY._15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: normalizeY(50),
    height: normalizeY(50),
    borderRadius: normalizeY(25),
    marginRight: spacingX._12,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacingY._4,
  },
  userName: {
    fontWeight: "600",
    color: colors.black,
    marginRight: normalizeX(8),
  },
  currentUserBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: normalizeX(6),
    paddingVertical: normalizeY(2),
    borderRadius: radius._10,
  },
  currentUserText: {
    color: colors.white,
    fontWeight: "700",
  },
  userEmail: {
    color: colors.textGray,
    marginBottom: spacingY._8,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleContainer: {
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._4,
    borderRadius: radius._6,
    marginRight: normalizeX(8),
  },
  roleText: {
    fontWeight: "600",
    fontSize: 11,
  },
  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error,
    paddingHorizontal: normalizeX(6),
    paddingVertical: normalizeY(2),
    borderRadius: radius._10,
  },
  blockedText: {
    color: colors.white,
    fontWeight: "700",
    marginLeft: spacingX._3,
  },
  permissionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacingY._15,
  },
  permissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._12,
  },
  permissionLabel: {
    color: colors.black,
    fontWeight: "500",
  },
  blockLabel: {
    color: colors.error,
  },
  adminInfo: {
    backgroundColor: colors.lightBlue,
    padding: spacingY._10,
    borderRadius: radius._6,
    marginTop: spacingY._10,
  },
  adminInfoText: {
    color: colors.textGray,
    fontStyle: "italic",
    textAlign: "center",
  },
});
