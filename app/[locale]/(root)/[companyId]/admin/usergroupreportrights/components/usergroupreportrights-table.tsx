"use client";

import { useEffect, useState } from "react";
import { IUserGroupReportRights } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { IUserGroupLookup } from "@/interfaces/lookup";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { UserGroupCombobox } from "@/components/ui/combobox/user-group-combobox";
import {
  useUserGroupReportRightSave,
  useUserGroupReportRightbyidGet,
} from "@/hooks/use-admin";
import {
  SettingTable,
  type SettingTableColumn,
} from "@/components/table/setting-table";
import { SaveConfirmation } from "@/components/ui/confirmation";

type ReportRightRow = IUserGroupReportRights;

export function UserGroupReportRightsTable() {
  const [selectedGroup, setSelectedGroup] = useState<IUserGroupLookup | null>(
    null
  );
  const [rights, setRights] = useState<ReportRightRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: rightsData,
    refetch: refetchRights,
    isFetching: isRightsLoading,
  } = useUserGroupReportRightbyidGet(Number(selectedGroup?.userGroupId) || 0);

  const userGroupReportRightSave = useUserGroupReportRightSave();

  useEffect(() => {
    if (rightsData) {
      const response = rightsData as ApiResponse<IUserGroupReportRights>;
      if (response?.data && Array.isArray(response.data)) {
        setRights(response.data);
      } else if (Array.isArray(rightsData)) {
        setRights(rightsData);
      } else {
        setRights([]);
      }
    } else {
      setRights([]);
    }
  }, [rightsData]);

  useEffect(() => {
    if (selectedGroup) refetchRights();
    else setRights([]);
  }, [selectedGroup, refetchRights]);

  const handlePermissionChange = (
    index: number,
    field: "isExport" | "isPrint",
    value: boolean
  ) => {
    setRights((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = () => {
    if (!selectedGroup) return;
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedGroup) return;
    try {
      setSaving(true);
      const userGroupId = Number(selectedGroup.userGroupId);
      const rightsToSave = rights.map((row) => ({
        ...row,
        userGroupId,
      }));
      await userGroupReportRightSave.mutateAsync({ data: rightsToSave });
      refetchRights();
      setShowSaveConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const columns: SettingTableColumn<ReportRightRow>[] = [
    { accessorKey: "moduleName", header: "Module", size: 140 },
    { accessorKey: "transactionName", header: "Transaction", size: 180 },
    {
      id: "isExport",
      header: "Export",
      size: 80,
      cell: (row, index) => (
        <Checkbox
          checked={row.isExport}
          onChange={(e) =>
            handlePermissionChange(index, "isExport", e.value ?? false)
          }
        />
      ),
    },
    {
      id: "isPrint",
      header: "Print",
      size: 80,
      cell: (row, index) => (
        <Checkbox
          checked={row.isPrint}
          onChange={(e) =>
            handlePermissionChange(index, "isPrint", e.value ?? false)
          }
        />
      ),
    },
  ];

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedGroup) refetchRights();
        }}
        className="mb-4 flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex items-end gap-4">
          <div className="w-64">
            <UserGroupCombobox
              value={selectedGroup}
              onChange={setSelectedGroup}
              label="User Group"
              isRequired
            />
          </div>
          <Button type="submit" fillMode="flat" disabled={isRightsLoading}>
            {isRightsLoading ? "Loading..." : "Search"}
          </Button>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !selectedGroup}
          themeColor="primary"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </form>
      <SettingTable
        data={rights}
        columns={columns}
        isLoading={isRightsLoading}
        emptyMessage="No data. Please select a user group."
        maxHeight="460px"
      />
      <SaveConfirmation
        title="Save User Group Report Rights"
        itemName={`report rights for ${selectedGroup?.userGroupName || "selected group"}`}
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={saving}
        operationType="update"
      />
    </div>
  );
}
