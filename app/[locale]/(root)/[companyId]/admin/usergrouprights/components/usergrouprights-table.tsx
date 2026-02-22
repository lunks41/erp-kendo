"use client";

import { useCallback, useEffect, useState } from "react";
import { IUserGroupRights } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { IUserGroupLookup } from "@/interfaces/lookup";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import type { GridCellProps } from "@progress/kendo-react-grid";
import { UserGroupCombobox } from "@/components/ui/combobox/user-group-combobox";
import {
  useUserGroupRightSave,
  useUserGroupRightbyidGet,
} from "@/hooks/use-admin";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { toast } from "@/components/layout/notification-container";

const PERM_FIELDS = [
  "isRead",
  "isCreate",
  "isEdit",
  "isDelete",
  "isExport",
  "isPrint",
  "isPost",
  "isDebitNote",
] as const;

type GroupRightRow = IUserGroupRights;

export function UserGroupRightsTable() {
  const [selectedGroup, setSelectedGroup] = useState<IUserGroupLookup | null>(
    null
  );
  const [rights, setRights] = useState<GroupRightRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: rightsData,
    refetch: refetchRights,
    isFetching: isRightsLoading,
  } = useUserGroupRightbyidGet(Number(selectedGroup?.userGroupId) || 0);

  const userGroupRightSave = useUserGroupRightSave();

  useEffect(() => {
    if (rightsData) {
      const response = rightsData as ApiResponse<IUserGroupRights>;
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

  const handlePermissionChange = useCallback(
    (index: number, field: keyof GroupRightRow, value: boolean) => {
      setRights((prev) =>
        prev.map((row, i) =>
          i === index ? { ...row, [field]: value } : row
        )
      );
    },
    []
  );

  const handleSelectAllForRow = useCallback(
    (index: number, value: boolean) => {
      setRights((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                isRead: value,
                isCreate: value,
                isEdit: value,
                isDelete: value,
                isExport: value,
                isPrint: value,
                isPost: value,
                isDebitNote: value,
              }
            : row
        )
      );
    },
    []
  );

  const handleSelectAllForColumn = useCallback(
    (field: keyof GroupRightRow, value: boolean) => {
      setRights((prev) =>
        prev.map((row) => ({ ...row, [field]: value }))
      );
    },
    []
  );

  const handleSelectAllForAll = useCallback((value: boolean) => {
    setRights((prev) =>
      prev.map((row) => ({
        ...row,
        isRead: value,
        isCreate: value,
        isEdit: value,
        isDelete: value,
        isExport: value,
        isPrint: value,
        isPost: value,
        isDebitNote: value,
      }))
    );
  }, []);

  const handleSave = () => {
    if (!selectedGroup) return;
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedGroup) return;
    try {
      setSaving(true);
      const userGroupId = Number(selectedGroup.userGroupId);
      const rightsToSave = rights.map((row) => ({ ...row, userGroupId }));
      await userGroupRightSave.mutateAsync({ data: rightsToSave });
      toast.success("Group rights saved successfully");
      refetchRights();
      setShowSaveConfirmation(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save group rights"
      );
    } finally {
      setSaving(false);
    }
  };

  const isRowAllChecked = (row: GroupRightRow) =>
    PERM_FIELDS.every((f) => row[f] === true);
  const isColAllChecked = (field: keyof GroupRightRow) =>
    rights.length > 0 && rights.every((r) => r[field] === true);
  const isSelectAllChecked =
    rights.length > 0 && rights.every(isRowAllChecked);

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

      {isRightsLoading ? (
        <div
          className="flex items-center justify-center rounded-lg border border-slate-200 py-12 dark:border-slate-700"
          style={{ minHeight: 200 }}
        >
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      ) : rights.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-lg border border-slate-200 py-12 dark:border-slate-700"
          style={{ minHeight: 200 }}
        >
          <span className="text-sm text-slate-500">
            No data. Please select a user group.
          </span>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
          style={{ maxHeight: "460px" }}
        >
          <Grid
            data={rights}
            style={{ height: "460px" }}
            skip={0}
            take={rights.length}
            total={rights.length}
            scrollable="scrollable"
          >
            <GridColumn
              field="moduleName"
              title="Module"
              width={140}
              sortable={false}
            />
            <GridColumn
              field="transactionName"
              title="Transaction"
              width={160}
              sortable={false}
            />
            <GridColumn
              field="__selectAll"
              title="Select All"
              width={90}
              sortable={false}
              cells={{
                data: (props: GridCellProps) => {
                  const idx = rights.indexOf(props.dataItem as GroupRightRow);
                  if (idx < 0) return null;
                  const row = props.dataItem as GroupRightRow;
                  return (
                    <td className="k-table-td">
                      <Checkbox
                        checked={isRowAllChecked(row)}
                        onChange={(e) =>
                          handleSelectAllForRow(idx, e.value ?? false)
                        }
                      />
                    </td>
                  );
                },
                headerCell: (props) => (
                  <th {...(props.thProps ?? {})} className="k-table-th">
                    <div className="flex flex-wrap items-center gap-2">
                      <Checkbox
                        checked={isSelectAllChecked}
                        onChange={(e) =>
                          handleSelectAllForAll(e.value ?? false)
                        }
                      />
                      <span>Select All</span>
                    </div>
                  </th>
                ),
              }}
            />
            <GridColumn
              field="isRead"
              title="View"
              width={80}
              sortable={false}
              cells={{
                data: (props: GridCellProps) => {
                  const idx = rights.indexOf(props.dataItem as GroupRightRow);
                  if (idx < 0) return null;
                  const row = props.dataItem as GroupRightRow;
                  return (
                    <td className="k-table-td">
                      <Checkbox
                        checked={row.isRead}
                        onChange={(e) =>
                          handlePermissionChange(idx, "isRead", e.value ?? false)
                        }
                      />
                    </td>
                  );
                },
                headerCell: (props) => (
                  <th {...(props.thProps ?? {})} className="k-table-th">
                    <div className="flex flex-wrap items-center gap-2">
                      <Checkbox
                        checked={isColAllChecked("isRead")}
                        onChange={(e) =>
                          handleSelectAllForColumn("isRead", e.value ?? false)
                        }
                      />
                      <span>View</span>
                    </div>
                  </th>
                ),
              }}
            />
            {(
              [
                ["isCreate", "Create", 80],
                ["isEdit", "Edit", 80],
                ["isDelete", "Delete", 80],
                ["isExport", "Export", 80],
                ["isPrint", "Print", 80],
                ["isPost", "Post", 80],
                ["isDebitNote", "Debit Note", 90],
              ] as const
            ).map(([field, title, width]) => (
              <GridColumn
                key={field}
                field={field}
                title={title}
                width={width}
                sortable={false}
                cells={{
                  data: (props: GridCellProps) => {
                    const idx = rights.indexOf(props.dataItem as GroupRightRow);
                    if (idx < 0) return null;
                    const row = props.dataItem as GroupRightRow;
                    return (
                      <td className="k-table-td">
                        <Checkbox
                          checked={row[field]}
                          onChange={(e) =>
                            handlePermissionChange(
                              idx,
                              field,
                              e.value ?? false
                            )
                          }
                        />
                      </td>
                    );
                  },
                  headerCell: (props) => (
                    <th {...(props.thProps ?? {})} className="k-table-th">
                      <div className="flex flex-wrap items-center gap-2">
                        <Checkbox
                          checked={isColAllChecked(field)}
                          onChange={(e) =>
                            handleSelectAllForColumn(field, e.value ?? false)
                          }
                        />
                        <span>{title}</span>
                      </div>
                    </th>
                  ),
                }}
              />
            ))}
          </Grid>
        </div>
      )}

      <SaveConfirmation
        title="Save User Group Rights"
        itemName={`rights for ${selectedGroup?.userGroupName || "selected group"}`}
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={saving}
        operationType="update"
      />
    </div>
  );
}
