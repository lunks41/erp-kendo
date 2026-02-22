"use client";

import { useCallback, useState } from "react";
import { IUser, IUserFilter } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { UserSchemaType } from "@/schemas/admin";
import { usePermissionStore } from "@/stores/permission-store";
import { useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { getById } from "@/lib/api-client";
import { User } from "@/lib/api-routes";
import { AdminTransactionId, ModuleId } from "@/lib/utils";
import { useDelete, useGet, usePersist } from "@/hooks/use-common";
import { Dialog } from "@progress/kendo-react-dialogs";
import { DeleteConfirmation, LoadConfirmation, SaveConfirmation } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";
import { UserForm } from "./components/user-form";
import { UserTable } from "./components/user-table";

export default function AdminUsersPage() {
  const moduleId = ModuleId.admin;
  const transactionId = AdminTransactionId.user;

  const { hasPermission } = usePermissionStore();
  const queryClient = useQueryClient();

  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");

  const [filters, setFilters] = useState<IUserFilter>({});
  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const {
    data: usersResponse,
    refetch: refetchUsers,
    isLoading: isLoadingUsers,
  } = useGet<IUser>(`${User.get}`, "users", searchFilter);

  const { data: usersData } = (usersResponse as ApiResponse<IUser>) ?? {
    result: 0,
    message: "",
    data: [],
  };

  const saveMutation = usePersist(`${User.add}`);
  const updateMutation = usePersist(`${User.add}`);
  const deleteMutation = useDelete(`${User.delete}`);

  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
  }>({ isOpen: false, userId: null, userName: null });

  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean;
    data: UserSchemaType | null;
  }>({ isOpen: false, data: null });

  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [existingUser, setExistingUser] = useState<IUser | null>(null);

  const handleFilterChange = useCallback((value: string) => {
    setSearchInput(value);
    setSearchFilter(value);
  }, []);

  const handleCreateUser = () => {
    setModalMode("create");
    setSelectedUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: IUser) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleViewUser = (user: IUser) => {
    if (!user) return;
    setModalMode("view");
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user: IUser) => {
    const userToDelete = usersData?.find((u) => u.userId === user.userId);
    if (!userToDelete) return;
    setDeleteConfirmation({
      isOpen: true,
      userId: String(user.userId),
      userName: userToDelete.userName,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.userId) {
      await deleteMutation.mutateAsync(deleteConfirmation.userId);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteConfirmation({ isOpen: false, userId: null, userName: null });
    }
  };

  const handleUserFormSubmit = async (data: UserSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["users"] });
      } else if (modalMode === "edit" && selectedUser) {
        const response = await updateMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["users"] });
      }
      setIsUserModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveConfirmation = (data: UserSchemaType) => {
    setSaveConfirmation({ isOpen: true, data });
  };

  const handleConfirmedFormSubmit = async (data: UserSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["users"] });
      } else if (modalMode === "edit" && selectedUser) {
        const response = await updateMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["users"] });
      }
      setIsUserModalOpen(false);
      setSaveConfirmation({ isOpen: false, data: null });
    } catch {
      // Error handled by mutation
    }
  };

  const handleCodeBlur = useCallback(
    async (code: string) => {
      if (modalMode === "edit" || modalMode === "view") return;
      const trimmedCode = code?.trim();
      if (!trimmedCode) return;
      try {
        const response = await getById(`${User.getbycode}/${trimmedCode}`);
        if (response?.result === 1 && response.data) {
          const userData = Array.isArray(response.data) ? response.data[0] : response.data;
          if (userData) {
            setExistingUser(userData as IUser);
            setShowLoadDialog(true);
          }
        }
      } catch {
        // Ignore
      }
    },
    [modalMode]
  );

  const handleLoadExisting = () => {
    if (existingUser) {
      setModalMode("edit");
      setSelectedUser(existingUser);
      setShowLoadDialog(false);
      setExistingUser(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <Users className="h-5 w-5" />
          Users
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Manage users</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {isLoadingUsers ? (
          <TableSkeleton rowCount={8} columnCount={6} />
        ) : (
          <UserTable
            data={usersData || []}
            isLoading={isLoadingUsers}
            onView={canView ? handleViewUser : undefined}
            onDelete={canDelete ? handleDeleteUser : undefined}
            onEdit={canEdit ? handleEditUser : undefined}
            onAdd={canCreate ? handleCreateUser : undefined}
            onRefresh={refetchUsers}
            searchFilter={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={() => setSearchFilter(searchInput)}
            onSearchClear={() => {
              setSearchInput("");
              setSearchFilter("");
            }}
            moduleId={moduleId}
            transactionId={transactionId}
            canEdit={canEdit}
            canDelete={canDelete}
            canView={canView}
            canCreate={canCreate}
          />
        )}
      </div>

      {isUserModalOpen && (
        <Dialog
          title={
            modalMode === "create" ? "Create User" : modalMode === "edit" ? "Update User" : "View User"
          }
          onClose={() => setIsUserModalOpen(false)}
          width={640}
        >
          <UserForm
            initialData={
              modalMode === "edit" || modalMode === "view" ? selectedUser : undefined
            }
            submitAction={handleUserFormSubmit}
            onCancelAction={() => setIsUserModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onSaveConfirmation={handleSaveConfirmation}
            onCodeBlur={handleCodeBlur}
          />
        </Dialog>
      )}

      <LoadConfirmation
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoad={handleLoadExisting}
        onCancelAction={() => setExistingUser(null)}
        code={existingUser?.userCode}
        name={existingUser?.userName}
        typeLabel="User"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title="Delete User"
        itemName={deleteConfirmation.userName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({ isOpen: false, userId: null, userName: null })
        }
        isDeleting={deleteMutation.isPending}
      />

      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={modalMode === "create" ? "Create User" : "Update User"}
        itemName={saveConfirmation.data?.userName || ""}
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data);
          }
          setSaveConfirmation({ isOpen: false, data: null });
        }}
        onCancelAction={() =>
          setSaveConfirmation({ isOpen: false, data: null })
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
