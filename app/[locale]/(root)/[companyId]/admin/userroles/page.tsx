"use client";

import { useCallback, useState } from "react";
import { IUserRole } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { UserRoleSchemaType } from "@/schemas/admin";
import { usePermissionStore } from "@/stores/permission-store";
import { useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { getById } from "@/lib/api-client";
import { UserRole } from "@/lib/api-routes";
import { AdminTransactionId, ModuleId } from "@/lib/utils";
import { useDelete, useGet, usePersist } from "@/hooks/use-common";
import { Dialog } from "@progress/kendo-react-dialogs";
import { DeleteConfirmation, LoadConfirmation, SaveConfirmation } from "@/components/ui/confirmation";
import { TableSkeleton } from "@/components/skeleton";
import { UserRoleForm } from "./components/user-role-form";
import { UserRoleTable } from "./components/user-role-table";

export default function AdminUserRolesPage() {
  const moduleId = ModuleId.admin;
  const transactionId = AdminTransactionId.userRoles;

  const { hasPermission } = usePermissionStore();
  const queryClient = useQueryClient();

  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");

  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const {
    data: rolesResponse,
    refetch: refetchRoles,
    isLoading: isLoadingRoles,
  } = useGet<IUserRole>(`${UserRole.get}`, "userroles", searchFilter);

  const { data: rolesData } = (rolesResponse as ApiResponse<IUserRole>) ?? {
    result: 0,
    message: "",
    data: [],
  };

  const saveMutation = usePersist(`${UserRole.add}`);
  const updateMutation = usePersist(`${UserRole.add}`);
  const deleteMutation = useDelete(`${UserRole.delete}`);

  const [selectedRole, setSelectedRole] = useState<IUserRole | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    roleId: string | null;
    roleName: string | null;
  }>({ isOpen: false, roleId: null, roleName: null });

  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean;
    data: UserRoleSchemaType | null;
  }>({ isOpen: false, data: null });

  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [existingRole, setExistingRole] = useState<IUserRole | null>(null);

  const handleCreate = () => {
    setModalMode("create");
    setSelectedRole(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (role: IUserRole) => {
    setModalMode("edit");
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleView = (role: IUserRole) => {
    setModalMode("view");
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (role: IUserRole) => {
    setDeleteConfirmation({
      isOpen: true,
      roleId: String(role.userRoleId),
      roleName: role.userRoleName,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.roleId) {
      await deleteMutation.mutateAsync(deleteConfirmation.roleId);
      queryClient.invalidateQueries({ queryKey: ["userroles"] });
      setDeleteConfirmation({ isOpen: false, roleId: null, roleName: null });
    }
  };

  const handleFormSubmit = async (data: UserRoleSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["userroles"] });
      } else if (modalMode === "edit" && selectedRole) {
        const response = await updateMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["userroles"] });
      }
      setIsModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveConfirmation = (data: UserRoleSchemaType) => {
    setSaveConfirmation({ isOpen: true, data });
  };

  const handleConfirmedSubmit = async (data: UserRoleSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = await saveMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["userroles"] });
      } else if (modalMode === "edit" && selectedRole) {
        const response = await updateMutation.mutateAsync(data);
        if (response.result === 1) queryClient.invalidateQueries({ queryKey: ["userroles"] });
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
        const response = await getById(`${UserRole.getbycode}/${trimmed}`);
        if (response?.result === 1 && response.data) {
          const item = Array.isArray(response.data) ? response.data[0] : response.data;
          if (item) {
            setExistingRole(item as IUserRole);
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
    if (existingRole) {
      setModalMode("edit");
      setSelectedRole(existingRole);
      setShowLoadDialog(false);
      setExistingRole(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
          <Shield className="h-5 w-5" />
          User Roles
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Manage user roles</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        {isLoadingRoles ? (
          <TableSkeleton rowCount={8} columnCount={6} />
        ) : (
          <UserRoleTable
            data={rolesData || []}
            onView={canView ? handleView : undefined}
            onDelete={canDelete ? handleDelete : undefined}
            onEdit={canEdit ? handleEdit : undefined}
            onAdd={canCreate ? handleCreate : undefined}
            onRefresh={refetchRoles}
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
              ? "Create User Role"
              : modalMode === "edit"
                ? "Update User Role"
                : "View User Role"
          }
          onClose={() => setIsModalOpen(false)}
          width={640}
        >
          <UserRoleForm
            initialData={
              modalMode === "edit" || modalMode === "view" ? selectedRole : undefined
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
        onCancelAction={() => setExistingRole(null)}
        code={existingRole?.userRoleCode}
        name={existingRole?.userRoleName}
        typeLabel="User Role"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(o) => setDeleteConfirmation((p) => ({ ...p, isOpen: o }))}
        title="Delete User Role"
        itemName={deleteConfirmation.roleName || ""}
        onConfirm={handleConfirmDelete}
        onCancelAction={() =>
          setDeleteConfirmation({ isOpen: false, roleId: null, roleName: null })
        }
        isDeleting={deleteMutation.isPending}
      />

      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(o) => setSaveConfirmation((p) => ({ ...p, isOpen: o }))}
        title={modalMode === "create" ? "Create User Role" : "Update User Role"}
        itemName={saveConfirmation.data?.userRoleName || ""}
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
