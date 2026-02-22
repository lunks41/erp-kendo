"use client";

import { useEffect, useState } from "react";
import { IUserRights } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { IUserLookup } from "@/interfaces/lookup";
import { Checkbox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Button } from "@progress/kendo-react-buttons";
import { UserCombobox } from "@/components/ui/combobox/user-combobox";
import { UserGroupCombobox } from "@/components/ui/combobox/user-group-combobox";
import { useUserRightSave, useUserRightbyidGet } from "@/hooks/use-admin";
import { useUserGroupLookup } from "@/hooks/use-lookup";
import {
  SettingTable,
  type SettingTableColumn,
} from "@/components/table/setting-table";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { toast } from "@/components/layout/notification-container";

type CompanyRight = {
  companyId: string;
  companyCode: string;
  companyName: string;
  isAccess: boolean;
  userGroupId: string;
};

export function UserRightsTable() {
  const [selectedUser, setSelectedUser] = useState<IUserLookup | null>(null);
  const [companyRights, setCompanyRights] = useState<CompanyRight[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const { data: userGroups = [], isLoading: isLoadingUserGroups } = useUserGroupLookup();

  const {
    data: userRightsData,
    refetch: refetchUserRights,
    isFetching: isRightsLoading,
  } = useUserRightbyidGet(Number(selectedUser?.userId) || 0);

  const userRightSave = useUserRightSave();

  useEffect(() => {
    if (userRightsData) {
      const response = userRightsData as ApiResponse<IUserRights>;
      if (response.data && Array.isArray(response.data)) {
        setCompanyRights(
          response.data.map((right) => ({
            companyId: right.companyId.toString(),
            companyCode: right.companyCode,
            companyName: right.companyName,
            isAccess: right.isAccess,
            userGroupId: right.userGroupId.toString(),
          }))
        );
      } else {
        setCompanyRights([]);
      }
    } else {
      setCompanyRights([]);
    }
  }, [userRightsData]);

  useEffect(() => {
    if (selectedUser) refetchUserRights();
    else setCompanyRights([]);
  }, [selectedUser, refetchUserRights]);

  const handleAccessChange = (companyId: string, checked: boolean) => {
    setCompanyRights((prev) =>
      prev.map((row) =>
        row.companyId === companyId
          ? { ...row, isAccess: checked, userGroupId: checked ? row.userGroupId : "" }
          : row
      )
    );
  };

  const handleGroupChange = (companyId: string, group: string) => {
    setCompanyRights((prev) =>
      prev.map((row) =>
        row.companyId === companyId ? { ...row, userGroupId: group } : row
      )
    );
  };

  const handleSave = () => {
    if (!selectedUser) return;
    const invalidRows = companyRights.filter((row) => row.isAccess && !row.userGroupId);
    if (invalidRows.length > 0) {
      toast.error("Please select a User Group for all companies with access enabled.");
      return;
    }
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const rightsToSave = companyRights.map((row) => ({
        companyId: Number(row.companyId),
        companyCode: row.companyCode,
        companyName: row.companyName,
        isAccess: row.isAccess,
        userId: Number(selectedUser.userId),
        userGroupId: Number(row.userGroupId) || 0,
      }));
      await userRightSave.mutateAsync({ data: rightsToSave });
      toast.success("User rights saved successfully");
      refetchUserRights();
      setShowSaveConfirmation(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save user rights"
      );
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = [
    { value: "", label: "Select Group" },
    ...userGroups.map((g) => ({
      value: String(g.userGroupId),
      label: g.userGroupName,
    })),
  ];

  const columns: SettingTableColumn<CompanyRight>[] = [
    { accessorKey: "companyCode", header: "Company Code", size: 120 },
    { accessorKey: "companyName", header: "Company Name", size: 180 },
    {
      id: "isAccess",
      header: "Is Access",
      size: 100,
      cell: (row) => (
        <Checkbox
          checked={row.isAccess}
          onChange={(e) => handleAccessChange(row.companyId, e.value ?? false)}
        />
      ),
    },
    {
      id: "userGroupId",
      header: "User Group",
      size: 180,
      cell: (row) => (
        <DropDownList
          data={groupOptions}
          value={groupOptions.find((o) => o.value === row.userGroupId) ?? null}
          onChange={(e) =>
            handleGroupChange(row.companyId, e.value?.value ?? "")
          }
          textField="label"
          dataItemKey="value"
          disabled={!row.isAccess}
          fillMode="outline"
          rounded="medium"
        />
      ),
    },
  ];

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedUser) refetchUserRights();
        }}
        className="mb-4 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex items-end gap-4">
          <div className="w-64">
            <UserCombobox
              value={selectedUser}
              onChange={setSelectedUser}
              label="User"
              isRequired
            />
          </div>
          <Button type="submit" fillMode="flat" disabled={isRightsLoading}>
            {isRightsLoading ? "Loading..." : "Search"}
          </Button>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !selectedUser}
          themeColor="primary"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>
      <SettingTable
        data={companyRights}
        columns={columns}
        isLoading={isRightsLoading}
        emptyMessage="No data. Please select a user."
        maxHeight="460px"
      />
      <SaveConfirmation
        title="Save User Rights"
        itemName={`user rights for ${selectedUser?.userName || "selected user"}`}
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={saving}
        operationType="update"
      />
    </div>
  );
}
