"use client";

import { useEffect, useState } from "react";
import { IShareData } from "@/interfaces/admin";
import { ApiResponse } from "@/interfaces/auth";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { useShareDataGet, useShareDataSave } from "@/hooks/use-admin";
import {
  SettingTable,
  type SettingTableColumn,
} from "@/components/table/setting-table";
import { SaveConfirmation } from "@/components/ui/confirmation";

type ShareDataRow = IShareData;

export function ShareDataTable() {
  const [shareData, setShareData] = useState<ShareDataRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: shareDataResponse,
    refetch: refetchShareData,
    isFetching: isShareDataLoading,
  } = useShareDataGet();

  const shareDataSave = useShareDataSave();

  useEffect(() => {
    if (shareDataResponse) {
      const response = shareDataResponse as ApiResponse<IShareData>;
      if (response?.data && Array.isArray(response.data)) {
        setShareData(response.data);
      } else if (Array.isArray(shareDataResponse)) {
        setShareData(shareDataResponse);
      } else {
        setShareData([]);
      }
    } else {
      setShareData([]);
    }
  }, [shareDataResponse]);

  const handleShareToAllChange = (index: number, value: boolean) => {
    setShareData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, shareToAll: value } : row))
    );
  };

  const handleSave = () => {
    setShowSaveConfirmation(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      await shareDataSave.mutateAsync({ data: shareData });
      refetchShareData();
      setShowSaveConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  const columns: SettingTableColumn<ShareDataRow>[] = [
    { accessorKey: "moduleName", header: "Module", size: 140 },
    { accessorKey: "transactionName", header: "Transaction", size: 180 },
    {
      id: "shareToAll",
      header: "Share To All",
      size: 120,
      cell: (row, index) => (
        <Checkbox
          checked={row.shareToAll}
          onChange={(e) => handleShareToAllChange(index, e.value ?? false)}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={saving || shareData.length === 0}
          themeColor="primary"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <SettingTable
        data={shareData}
        columns={columns}
        isLoading={isShareDataLoading}
        emptyMessage="No data available."
        maxHeight="460px"
      />
      <SaveConfirmation
        title="Save Share Data"
        itemName="share data settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={saving}
        operationType="update"
      />
    </div>
  );
}
