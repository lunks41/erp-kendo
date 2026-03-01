"use client";

import React, { useMemo, useCallback } from "react";
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridSearchBox,
  GridCsvExportButton,
  GridPdfExportButton,
  GridToolbarSpacer,
} from "@progress/kendo-react-grid";
import { createActionCell } from "@/components/table/master-action-cell";
import type { IArInvoiceDt } from "@/interfaces/ar-invoice";
import type { IVisibleFields } from "@/interfaces/setting";
import { useAuthStore } from "@/stores/auth-store";
import {
  InvoiceDetailReadOnlyNumber,
  InvoiceDetailNumberCell,
  InvoiceDetailAmountCell,
  InvoiceDetailTextCell,
  InvoiceDetailDateCell,
} from "./invoice-details-table-cells";

const TABLE_HEIGHT = "min(400px, 50vh)";

export type InvoiceDetailRow = IArInvoiceDt & { inEdit?: boolean };

export type InvoiceDetailItemChangePayload = {
  dataItem: InvoiceDetailRow;
  field: string;
  value: string | number | Date | null;
  dataIndex: number;
};

interface InvoiceDetailsGridInlineProps {
  data: InvoiceDetailRow[];
  visible: IVisibleFields;
  onItemChangeAction: (payload: InvoiceDetailItemChangePayload) => void;
  onDeleteAction?: (itemNo: number) => void;
  onEditAction?: (detail: IArInvoiceDt) => void;
  isCancelled?: boolean;
}

export function InvoiceDetailsGridInline({
  data,
  visible,
  onItemChangeAction,
  onDeleteAction,
  onEditAction,
  isCancelled = false,
}: InvoiceDetailsGridInlineProps) {
  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;

  const handleValueChange = useCallback(
    (itemNo: number, field: string, value: string | number | Date | null) => {
      const dataIndex = data.findIndex((r) => r.itemNo === itemNo);
      const dataItem = data[dataIndex];
      if (dataItem) {
        onItemChangeAction({ dataItem, field, value, dataIndex });
      }
    },
    [data, onItemChangeAction],
  );

  const handleDelete = useCallback(
    (dataItem: InvoiceDetailRow) => {
      onDeleteAction?.(dataItem.itemNo);
    },
    [onDeleteAction],
  );

  const ActionCellComponent = useMemo(
    () =>
      createActionCell<InvoiceDetailRow>(
        undefined,
        isCancelled ? undefined : onEditAction as (item: InvoiceDetailRow) => void,
        isCancelled ? undefined : handleDelete,
        false,
        !isCancelled && !!onEditAction,
        !isCancelled && !!onDeleteAction,
      ),
    [isCancelled, onEditAction, handleDelete, onDeleteAction],
  );

  type CellProps = {
    dataItem: InvoiceDetailRow;
    field?: string;
    tdProps?: React.TdHTMLAttributes<HTMLTableCellElement> | null;
  };

  const columns = useMemo(() => {
    const base: React.ReactElement[] = [
      <GridColumn
        key="__actions"
        field="__actions"
        title="Actions"
        width={150}
        locked
        sortable={false}
        filterable={false}
        cells={{ data: ActionCellComponent }}
      />,
      <GridColumn
        key="itemNo"
        field="itemNo"
        title="Item No"
        width={80}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailReadOnlyNumber dataItem={props.dataItem} field="itemNo" />
            </td>
          ),
        }}
      />,
      <GridColumn
        key="seqNo"
        field="seqNo"
        title="Seq No"
        width={70}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailReadOnlyNumber dataItem={props.dataItem} field="seqNo" />
            </td>
          ),
        }}
      />,
      <GridColumn
        key="docItemNo"
        field="docItemNo"
        title="Doc Item No"
        width={90}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailReadOnlyNumber dataItem={props.dataItem} field="docItemNo" />
            </td>
          ),
        }}
      />,
    ];

    if (visible?.m_ProductId) {
      base.push(
        <GridColumn key="productCode" field="productCode" title="Product Code" width={110} />,
        <GridColumn key="productName" field="productName" title="Product" width={140} />,
      );
    }
    base.push(
      <GridColumn key="glCode" field="glCode" title="Code" width={100} />,
      <GridColumn key="glName" field="glName" title="Account" width={140} />,
    );
    if (visible?.m_DepartmentId) {
      base.push(
        <GridColumn key="departmentCode" field="departmentCode" title="Dept Code" width={90} />,
        <GridColumn key="departmentName" field="departmentName" title="Department" width={120} />,
      );
    }
    if (visible?.m_QTY) {
      base.push(
        <GridColumn
          key="qty"
          field="qty"
          title="Qty"
          width={90}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="qty"
                  decimals={0}
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
        <GridColumn
          key="billQTY"
          field="billQTY"
          title="Bill Qty"
          width={90}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="billQTY"
                  decimals={0}
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
      );
    }
    if (visible?.m_UomId) {
      base.push(
        <GridColumn key="uomCode" field="uomCode" title="UOM Code" width={80} />,
        <GridColumn key="uomName" field="uomName" title="UOM" width={80} />,
      );
    }
    if (visible?.m_UnitPrice) {
      base.push(
        <GridColumn
          key="unitPrice"
          field="unitPrice"
          title="Price"
          width={100}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="unitPrice"
                  decimals={amtDec}
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
      );
    }
    base.push(
      <GridColumn
        key="totAmt"
        field="totAmt"
        title="Amount"
        width={110}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailAmountCell
                dataItem={props.dataItem}
                field="totAmt"
                decimals={amtDec}
              />
            </td>
          ),
        }}
      />,
      <GridColumn
        key="totLocalAmt"
        field="totLocalAmt"
        title="Local Amount"
        width={110}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailAmountCell
                dataItem={props.dataItem}
                field="totLocalAmt"
                decimals={locAmtDec}
              />
            </td>
          ),
        }}
      />,
    );
    if (visible?.m_Remarks !== false) {
      base.push(
        <GridColumn
          key="remarks"
          field="remarks"
          title="Remarks"
          width={120}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailTextCell
                  dataItem={props.dataItem}
                  field="remarks"
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
      );
    }
    if (visible?.m_DebitNoteNo !== false) {
      base.push(
        <GridColumn
          key="debitNoteNo"
          field="debitNoteNo"
          title="Debit Note No"
          width={110}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailTextCell
                  dataItem={props.dataItem}
                  field="debitNoteNo"
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
      );
    }
    if (visible?.m_GstId) {
      base.push(
        <GridColumn key="gstName" field="gstName" title="Gst" width={90} />,
        <GridColumn
          key="gstPercentage"
          field="gstPercentage"
          title="VAT %"
          width={80}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="gstPercentage"
                  decimals={2}
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
        <GridColumn
          key="gstAmt"
          field="gstAmt"
          title="VAT Amount"
          width={100}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailAmountCell
                  dataItem={props.dataItem}
                  field="gstAmt"
                  decimals={amtDec}
                />
              </td>
            ),
          }}
        />,
        <GridColumn
          key="gstLocalAmt"
          field="gstLocalAmt"
          title="VAT Local"
          width={100}
          cells={{
            data: (props: CellProps) => (
              <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
                <InvoiceDetailAmountCell
                  dataItem={props.dataItem}
                  field="gstLocalAmt"
                  decimals={locAmtDec}
                />
              </td>
            ),
          }}
        />,
      );
    }
    base.push(
      <GridColumn
        key="deliveryDate"
        field="deliveryDate"
        title="Delivery Date"
        width={120}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailDateCell
                dataItem={props.dataItem}
                field="deliveryDate"
                onValueChange={(field, value) =>
                  handleValueChange(props.dataItem.itemNo, field, value)
                }
              />
            </td>
          ),
        }}
      />,
      <GridColumn
        key="supplyDate"
        field="supplyDate"
        title="Supply Date"
        width={120}
        cells={{
          data: (props: CellProps) => (
            <td {...(props.tdProps ?? {})} className="k-table-td min-h-9 h-9 align-middle">
              <InvoiceDetailDateCell
                dataItem={props.dataItem}
                field="supplyDate"
                onValueChange={(field, value) =>
                  handleValueChange(props.dataItem.itemNo, field, value)
                }
              />
            </td>
          ),
        }}
      />,
      <GridColumn key="vesselName" field="vesselName" title="Vessel" width={100} />,
      <GridColumn key="portName" field="portName" title="Port" width={100} />,
      <GridColumn key="supplierName" field="supplierName" title="Supplier" width={120} />,
      <GridColumn key="apInvoiceNo" field="apInvoiceNo" title="AP Invoice No" width={120} />,
    );
    return base;
  }, [
    visible,
    amtDec,
    locAmtDec,
    handleValueChange,
    ActionCellComponent,
  ]);

  return (
    <div
      className="k-grid-container min-w-0 shrink-0 overflow-auto rounded border border-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800/50"
      style={{ height: TABLE_HEIGHT }}
    >
      <Grid
        data={data}
        dataItemKey="itemNo"
        pageable={false}
        pageSize={9999}
        sortable
        filterable={false}
        resizable
        reorderable
        scrollable="scrollable"
        className="w-full"
        style={{ height: "100%", minHeight: 0 }}
      >
        {columns}
        <GridToolbar>
          <GridCsvExportButton>Excel</GridCsvExportButton>
          <GridPdfExportButton>PDF</GridPdfExportButton>
          <GridToolbarSpacer />
          <GridSearchBox placeholder="Search..." />
        </GridToolbar>
      </Grid>
    </div>
  );
}
