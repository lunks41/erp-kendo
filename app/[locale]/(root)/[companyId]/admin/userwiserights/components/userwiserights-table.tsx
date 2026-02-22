"use client";

import { useEffect, useState } from "react";
import { IUserRightsv1 } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { IUserLookup } from "@/interfaces/lookup";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { UserCombobox } from "@/components/ui/combobox/user-combobox";
import {
  useUserRightSaveV1,
  useUserRightbyidGetV1,
} from "@/hooks/use-admin";
import {
  SettingTable,
  type SettingTableColumn,
} from "@/components/table/setting-table";
import { SaveConfirmation } from "@/components/ui/confirmation";

type UserRightRow = IUserRightsv1;

export function UserWiseRightsTable() {
  const [selectedUser, setSelectedUser] = useState<IUserLookup | null>(null);
  const [rights, setRights] = useState<UserRightRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: rightsData,
    refetch: refetchRights,
    isFetching: isRightsLoading,
  } = useUserRightbyidGetV1(Number(selectedUser?.userId) || 0);

  const userRightSaveV1 = useUserRightSaveV1();

  useEffect(() => {
    if (rightsData) {
      const response = rightsData as ApiResponse<IUserRightsv1>;
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
    if (selectedUser) refetchRights();
    else setRights([]);
  }, [selectedUser, refetchRights]);

  const handlePermissionChange = (
    index: number,
    field: keyof Pick<
      UserRightRow,
      | "isRead"
      | "isCreate"
      | "isEdit"
      | "isDelete"
      | "isExport"
      | "isPrint"
      | "isPost"
    >,
    value: boolean
  ) => {
    setRights((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = () => {
    if (!selectedUser) return;
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const userId = Number(selectedUser.userId);
      const rightsToSave = rights.map((row) => ({
        ...row,
        userId,
      }));
      await userRightSaveV1.mutateAsync({ data: rightsToSave });
      refetchRights();
      setShowSaveConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const permCol = (
    id: keyof Pick<
      UserRightRow,
      | "isRead"
      | "isCreate"
      | "isEdit"
      | "isDelete"
      | "isExport"
      | "isPrint"
      | "isPost"
    >,
    header: string,
    size = 80
  ): SettingTableColumn<UserRightRow> => ({
    id,
    header,
    size,
    cell: (row, index) => (
      <Checkbox
        checked={row[id] as boolean}
        onChange={(e) =>
          handlePermissionChange(index, id, e.value ?? false)
        }
      />
    ),
  });

  const columns: SettingTableColumn<UserRightRow>[] = [
    { accessorKey: "moduleName", header: "Module", size: 140 },
    { accessorKey: "transactionName", header: "Transaction", size: 160 },
    permCol("isRead", "Read"),
    permCol("isCreate", "Create"),
    permCol("isEdit", "Edit"),
    permCol("isDelete", "Delete"),
    permCol("isExport", "Export"),
    permCol("isPrint", "Print"),
    permCol("isPost", "Post"),
  ];

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedUser) refetchRights();
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
        data={rights}
        columns={columns}
        isLoading={isRightsLoading}
        emptyMessage="No data. Please select a user."
        maxHeight="460px"
      />
      <SaveConfirmation
        title="Save User Rights"
        itemName={`rights for ${selectedUser?.userName || "selected user"}`}
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={saving}
        operationType="update"
      />
    </div>
  );
}
