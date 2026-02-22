"use client";

import { useCallback, useState } from "react";
import { IUserGroup, IUserGroupFilter } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { UserGroupSchemaType } from "@/schemas/admin";
import { usePermissionStore } from "@/stores/permission-store";
import { useQueryClient } from "@tanstack/react-query";
import { UsersRound } from "lucide-react";
import { getById } from "@/lib/api-client";
import { UserGroup } from "@/lib/api-routes";
import { AdminTransactionId, ModuleId } from "@/lib/utils";
import { useDelete, useGet, usePersist } from "@/hooks/use-common";
import { Dialog } from "@progress/kendo-react-dialogs";
import { DeleteConfirmation, LoadConfirmation, SaveConfirmation } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";
import { UserGroupForm } from "./components/user-group-form";
import { UserGroupTable } from "./components/user-group-table";

export default function AdminUserGroupsPage() {
  const moduleId = ModuleId.admin;
  const transactionId = AdminTransactionId.userGroup;

  const { hasPermission } = usePermissionStore();
  const queryClient = useQueryClient();

  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");

  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const {
    data: userGroupsResponse,
    refetch: refetchUserGroups,
    isLoading: isLoadingUserGroups,
  } = useGet<IUserGroup>(`${UserGroup.get}`, "usergroups", searchFilter);

  const { data: userGroupsData } = (userGroupsResponse as ApiResponse<IUserGroup>) ?? {
    result: 0,
    message: "",
    data: [],
  };

  const saveMutation = usePersist(`${UserGroup.add}`);
  const updateMutation = usePersist(`${UserGroup.add}`);
  const deleteMutation = useDelete(`${UserGroup.delete}`);

  const [selectedGroup, setSelectedGroup] = useState<IUserGroup | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    groupId: string | null;
    groupName: string | null;
  }>({ isOpen: false, groupId: null, groupName: null });

  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean;
    data: UserGroupSchemaType | null;
  }>({ isOpen: false, data: null });

  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [existingGroup, setExistingGroup] = useState<IUserGroup | null>(null);

  const handleCreate = () => {
    setModalMode("create");
    setSelectedGroup(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (group: IUserGroup) => {
    setModalMode("edit");
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleView = (group: IUserGroup) => {
    setModalMode("view");
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleDelete = (group: IUserGroup) => {
    setDeleteConfirmation({
      isOpen: true,
      groupId: String(group.userGroupId),
      groupName: group.userGroupName,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.groupId) {
      await deleteMutation.mutateAsync(deleteConfirmation.groupId);
      queryClient.invalidateQueries({ queryKey: ["usergroups"] });
      setDeleteConfirmation({ isOpen: false, groupId: null, groupName: null });
    }
  };

  const handleFormSubmit = async (data: UserGroupSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["usergroups"] });
      } else if (modalMode === "edit" && selectedGroup) {
        const response = await updateMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["usergroups"] });
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveConfirmation = (data: UserGroupSchemaType) => {
    setSaveConfirmation({ isOpen: true, data });
  };

  const handleConfirmedSubmit = async (data: UserGroupSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["usergroups"] });
      } else if (modalMode === "edit" && selectedGroup) {
        const response = await updateMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["usergroups"] });
      }
      setIsModalOpen(false);
      setSaveConfirmation({ isOpen: false, data: null });
    } catch {
      // Error handled by mutation
    }
  };

  const handleCodeBlur = useCallback(
    async (code: string) => {
      if (modalMode === "edit" || modalMode === "view") return;
      const trimmed = code?.trim();
      if (!trimmed) return;
      try {
        const response = await getById(`${UserGroup.getbycode}/${trimmed}`);
        if (response?.result === 1 && response.data) {
          const item = Array.isArray(response.data) ? response.data[0] : response.data;
          if (item) {
            setExistingGroup(item as IUserGroup);
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
    if (existingGroup) {
      setModalMode("edit");
      setSelectedGroup(existingGroup);
      setShowLoadDialog(false);
      setExistingGroup(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <UsersRound className="h-5 w-5" />
          User Groups
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Manage user groups</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {isLoadingUserGroups ? (
          <TableSkeleton rowCount={8} columnCount={6} />
        ) : (
          <UserGroupTable
            data={userGroupsData || []}
            onView={canView ? handleView : undefined}
            onDelete={canDelete ? handleDelete : undefined}
            onEdit={canEdit ? handleEdit : undefined}
            onAdd={canCreate ? handleCreate : undefined}
            onRefresh={refetchUserGroups}
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

      {isModalOpen && (
        <Dialog
          title={
            modalMode === "create"
              ? "Create User Group"
              : modalMode === "edit"
                ? "Update User Group"
                : "View User Group"
          }
          onClose={() => setIsModalOpen(false)}
          width={640}
        >
          <UserGroupForm
            initialData={
              modalMode === "edit" || modalMode === "view" ? selectedGroup : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
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
        onCancelAction={() => setExistingGroup(null)}
        code={existingGroup?.userGroupCode}
        name={existingGroup?.userGroupName}
        typeLabel="User Group"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(o) => setDeleteConfirmation((p) => ({ ...p, isOpen: o }))}
        title="Delete User Group"
        itemName={deleteConfirmation.groupName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({ isOpen: false, groupId: null, groupName: null })
        }
        isDeleting={deleteMutation.isPending}
      />

      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(o) => setSaveConfirmation((p) => ({ ...p, isOpen: o }))}
        title={modalMode === "create" ? "Create User Group" : "Update User Group"}
        itemName={saveConfirmation.data?.userGroupName || ""}
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) handleConfirmedSubmit(saveConfirmation.data);
          setSaveConfirmation({ isOpen: false, data: null });
        }}
        onCancelAction={() => setSaveConfirmation({ isOpen: false, data: null })}
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
