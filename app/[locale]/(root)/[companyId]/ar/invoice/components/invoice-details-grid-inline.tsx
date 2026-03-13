"use client";

import React, { useMemo, useCallback, useRef, useEffect, useLayoutEffect } from "react";
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
  InvoiceDetailAmountCell,
  InvoiceDetailChartOfAccountCell,
  InvoiceDetailDateCell,
  InvoiceDetailDepartmentCell,
  InvoiceDetailGstCell,
  InvoiceDetailNumberCell,
  InvoiceDetailPortCell,
  InvoiceDetailProductCell,
  InvoiceDetailReadOnlyNumber,
  InvoiceDetailTextCell,
  InvoiceDetailUomCell,
  InvoiceDetailVesselCell,
  InvoiceDetailBargeCell,
} from "./invoice-details-table-cells";

const TABLE_HEIGHT = "min(400px, 50vh)";

export type InvoiceDetailRow = IArInvoiceDt;

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
  editingItemNo?: number | null;
  onAddRowAction?: () => void;
}

export function InvoiceDetailsGridInline({
  data,
  visible,
  onItemChangeAction,
  onDeleteAction,
  onEditAction,
  isCancelled = false,
  editingItemNo,
  onAddRowAction,
}: InvoiceDetailsGridInlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks which input slot (by index) had focus before a re-render so we can
  // restore it after form.setValue destroys and recreates input DOM elements.
  const focusedInputIdxRef = useRef<number>(-1);
  const lastActiveElRef = useRef<HTMLElement | null>(null);
  // Set to true when Tab from last column triggers a new row add; cleared once
  // useLayoutEffect focuses the first input of the newly added row.
  const shouldFocusFirstRef = useRef(false);

  // Record the focused input index whenever focus moves inside the grid.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName !== "INPUT" || el.closest(".k-popup")) return;
      lastActiveElRef.current = el;
      const inputs = Array.from(
        container.querySelectorAll<HTMLInputElement>("input:not([disabled])"),
      ).filter((i) => !i.closest(".k-popup") && i.offsetParent !== null);
      const idx = inputs.indexOf(el as HTMLInputElement);
      if (idx !== -1) focusedInputIdxRef.current = idx;
    };
    container.addEventListener("focusin", onFocusIn);
    return () => container.removeEventListener("focusin", onFocusIn);
  }, []);

  // After every render while a row is being edited, if focus escaped the grid
  // because the previously focused input element was destroyed by a re-render,
  // put focus back on the same input slot.
  useLayoutEffect(() => {
    if (editingItemNo == null) return;
    const container = containerRef.current;
    if (!container) return;

    const inputs = Array.from(
      container.querySelectorAll<HTMLInputElement>("input:not([disabled])"),
    ).filter((i) => !i.closest(".k-popup") && i.offsetParent !== null);

    // A new row was added via Tab — focus the first input of the new row.
    if (shouldFocusFirstRef.current) {
      if (inputs.length > 0) {
        shouldFocusFirstRef.current = false;
        focusedInputIdxRef.current = 0;
        lastActiveElRef.current = inputs[0];
        inputs[0].focus();
        inputs[0].select?.();
      }
      return;
    }

    if (focusedInputIdxRef.current === -1) return;
    // Focus is still inside the grid — nothing to do.
    if (container.contains(document.activeElement)) return;
    // The old element is still in the DOM, so focus moved intentionally (e.g. user clicked elsewhere).
    if (lastActiveElRef.current && document.body.contains(lastActiveElRef.current)) return;
    // The old element was removed (re-render destroyed it). Restore focus by index.
    const target = inputs[focusedInputIdxRef.current];
    if (target) target.focus();
  });

  const { decimals } = useAuthStore();
  const amtDec = decimals[0]?.amtDec ?? 2;
  const locAmtDec = decimals[0]?.locAmtDec ?? 2;

  const handleValueChange = useCallback(
    (itemNo: number, field: string, value: string | number | Date | null) => {
      const dataIndex = data.findIndex((d) => d.itemNo === itemNo);
      const minimalItem = { itemNo } as InvoiceDetailRow;
      onItemChangeAction({
        dataItem: minimalItem,
        field,
        value,
        dataIndex: dataIndex >= 0 ? dataIndex : -1,
      });
    },
    [onItemChangeAction, data],
  );

  const handleDelete = useCallback(
    (dataItem: InvoiceDetailRow) => {
      onDeleteAction?.(dataItem.itemNo);
    },
    [onDeleteAction],
  );

  // Trap Tab within the grid when a row is being edited.
  // Kendo Grid's built-in keyboard navigation causes Tab to escape the app;
  // we intercept it and move focus between inputs inside the container ourselves.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab" || editingItemNo == null) return;

      // Let Kendo popup (open dropdown) handle its own Tab to close itself
      const active = document.activeElement as HTMLElement | null;
      if (active?.closest(".k-popup")) return;

      const container = containerRef.current;
      if (!container) return;

      // Collect all visible inputs inside the grid (excludes popup inputs)
      const inputs = Array.from(
        container.querySelectorAll<HTMLInputElement>("input:not([disabled])"),
      ).filter((el) => !el.closest(".k-popup") && el.offsetParent !== null);

      const idx = inputs.indexOf(active as HTMLInputElement);
      if (idx === -1) return;

      const nextIdx = e.shiftKey ? idx - 1 : idx + 1;

      // Shift+Tab at first input — let browser move focus out naturally
      if (nextIdx < 0) return;

      // Tab past the last input — add a new row and focus its first input
      if (nextIdx >= inputs.length) {
        if (!e.shiftKey && onAddRowAction && !isCancelled) {
          e.preventDefault();
          e.stopPropagation();
          shouldFocusFirstRef.current = true;
          focusedInputIdxRef.current = -1;
          lastActiveElRef.current = null;
          onAddRowAction();
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      inputs[nextIdx].focus();
      inputs[nextIdx].select?.();
    },
    [editingItemNo, onAddRowAction, isCancelled],
  );

  const ActionCellComponent = useMemo(
    () =>
      createActionCell<InvoiceDetailRow>(
        undefined,
        isCancelled
          ? undefined
          : (onEditAction as (item: InvoiceDetailRow) => void),
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
    const itemNoColumn = (
      <GridColumn
        key="itemNo"
        field="itemNo"
        title="Item No"
        width={80}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailReadOnlyNumber
                dataItem={props.dataItem}
                field="itemNo"
              />
            </td>
          ),
        }}
      />
    );

    const docItemNoColumn = (
      <GridColumn
        key="docItemNo"
        field="docItemNo"
        title="Doc Item No"
        width={90}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailReadOnlyNumber
                dataItem={props.dataItem}
                field="docItemNo"
              />
            </td>
          ),
        }}
      />
    );

    const base: React.ReactElement[] = [
      <GridColumn
        key="__actions"
        field="__actions"
        title="Actions"
        width={100}
        locked
        sortable={false}
        filterable={false}
        cells={{ data: ActionCellComponent }}
      />,
      <GridColumn
        key="seqNo"
        field="seqNo"
        title="Seq No"
        width={60}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailReadOnlyNumber
                dataItem={props.dataItem}
                field="seqNo"
              />
            </td>
          ),
        }}
      />,
    ];

    if (visible?.m_ProductId) {
      base.push(
        <GridColumn
          key="productName"
          field="productName"
          title="Product"
          width={200}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailProductCell
                  dataItem={props.dataItem}
                  field="productName"
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
        key="glName"
        field="glName"
        title="Account"
        width={220}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailChartOfAccountCell
                dataItem={props.dataItem}
                field="glName"
                isEditing={props.dataItem.itemNo === editingItemNo}
                onValueChange={(field, value) =>
                  handleValueChange(props.dataItem.itemNo, field, value)
                }
              />
            </td>
          ),
        }}
      />,
    );
    if (visible?.m_DepartmentId) {
      base.push(
        <GridColumn
          key="departmentName"
          field="departmentName"
          title="Department"
          width={200}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailDepartmentCell
                  dataItem={props.dataItem}
                  field="departmentName"
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
    if (visible?.m_QTY) {
      base.push(
        <GridColumn
          key="qty"
          field="qty"
          title="Qty"
          width={70}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="qty"
                  decimals={amtDec}
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
          width={70}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="billQTY"
                  decimals={amtDec}
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
        <GridColumn
          key="uomName"
          field="uomName"
          title="UOM"
          width={140}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailUomCell
                  dataItem={props.dataItem}
                  field="uomName"
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
    if (visible?.m_UnitPrice) {
      base.push(
        <GridColumn
          key="unitPrice"
          field="unitPrice"
          title="Price"
          width={100}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="unitPrice"
                  decimals={amtDec}
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
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
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
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
    if (visible?.m_GstId) {
      base.push(
        <GridColumn
          key="gstName"
          field="gstName"
          title="GST"
          width={140}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailGstCell
                  dataItem={props.dataItem}
                  field="gstName"
                  isEditing={props.dataItem.itemNo === editingItemNo}
                  onValueChange={(field, value) =>
                    handleValueChange(props.dataItem.itemNo, field, value)
                  }
                />
              </td>
            ),
          }}
        />,
        <GridColumn
          key="gstPercentage"
          field="gstPercentage"
          title="GST %"
          width={80}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailNumberCell
                  dataItem={props.dataItem}
                  field="gstPercentage"
                  decimals={amtDec}
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
          title="GST Amount"
          width={100}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
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
          title="GST Local"
          width={100}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
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
    if (visible?.m_Remarks !== false) {
      base.push(
        <GridColumn
          key="remarks"
          field="remarks"
          title="Remarks"
          width={120}
          cells={{
            data: (props: CellProps) => (
              <td
                {...(props.tdProps ?? {})}
                className="k-table-td min-h-9 h-9 align-middle"
              >
                <InvoiceDetailTextCell
                  dataItem={props.dataItem}
                  field="remarks"
                  isEditing={props.dataItem.itemNo === editingItemNo}
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
        key="vesselName"
        field="vesselName"
        title="Vessel"
        width={140}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailVesselCell
                dataItem={props.dataItem}
                field="vesselName"
                isEditing={props.dataItem.itemNo === editingItemNo}
                onValueChange={(field, value) =>
                  handleValueChange(props.dataItem.itemNo, field, value)
                }
              />
            </td>
          ),
        }}
      />,
      <GridColumn
        key="portName"
        field="portName"
        title="Port"
        width={140}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailPortCell
                dataItem={props.dataItem}
                field="portName"
                isEditing={props.dataItem.itemNo === editingItemNo}
                onValueChange={(field, value) =>
                  handleValueChange(props.dataItem.itemNo, field, value)
                }
              />
            </td>
          ),
        }}
      />,
      ...(visible?.m_BargeId
        ? [
            <GridColumn
              key="bargeName"
              field="bargeName"
              title="Barge"
              width={140}
              cells={{
                data: (props: CellProps) => (
                  <td
                    {...(props.tdProps ?? {})}
                    className="k-table-td min-h-9 h-9 align-middle"
                  >
                    <InvoiceDetailBargeCell
                      dataItem={props.dataItem}
                      field="bargeName"
                      isEditing={props.dataItem.itemNo === editingItemNo}
                      onValueChange={(field, value) =>
                        handleValueChange(props.dataItem.itemNo, field, value)
                      }
                    />
                  </td>
                ),
              }}
            />,
          ]
        : []),
      <GridColumn
        key="supplierName"
        field="supplierName"
        title="Supplier"
        width={120}
      />,
      <GridColumn
        key="apInvoiceNo"
        field="apInvoiceNo"
        title="AP Invoice No"
        width={120}
      />,
      itemNoColumn,
      docItemNoColumn,
      <GridColumn
        key="deliveryDate"
        field="deliveryDate"
        title="Delivery Date"
        width={120}
        cells={{
          data: (props: CellProps) => (
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailDateCell
                dataItem={props.dataItem}
                field="deliveryDate"
                isEditing={props.dataItem.itemNo === editingItemNo}
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
            <td
              {...(props.tdProps ?? {})}
              className="k-table-td min-h-9 h-9 align-middle"
            >
              <InvoiceDetailDateCell
                dataItem={props.dataItem}
                field="supplyDate"
                isEditing={props.dataItem.itemNo === editingItemNo}
                onValueChange={(field, value) =>
                  handleValueChange(props.dataItem.itemNo, field, value)
                }
              />
            </td>
          ),
        }}
      />,
      ...(visible?.m_DebitNoteNo !== false
        ? [
            <GridColumn
              key="debitNoteNo"
              field="debitNoteNo"
              title="Debit Note No"
              width={110}
              cells={{
                data: (props: CellProps) => (
                  <td
                    {...(props.tdProps ?? {})}
                    className="k-table-td min-h-9 h-9 align-middle"
                  >
                    <InvoiceDetailTextCell
                      dataItem={props.dataItem}
                      field="debitNoteNo"
                      isEditing={props.dataItem.itemNo === editingItemNo}
                      onValueChange={(field, value) =>
                        handleValueChange(props.dataItem.itemNo, field, value)
                      }
                    />
                  </td>
                ),
              }}
            />,
          ]
        : []),
    );
    return base;
  }, [
    visible,
    amtDec,
    locAmtDec,
    handleValueChange,
    ActionCellComponent,
    editingItemNo,
  ]);

  return (
    <div
      ref={containerRef}
      className="k-grid-container min-w-0 shrink-0 overflow-auto rounded border border-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800/50"
      style={{ height: TABLE_HEIGHT }}
      onKeyDown={handleKeyDown}
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
        navigatable={false}
        scrollable="scrollable"
        className="w-full"
        style={{ height: "100%", minHeight: 0 }}
      >
        {columns}
        <GridToolbar>
          {!isCancelled && onAddRowAction && (
            <button
              type="button"
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base mr-2"
              onClick={onAddRowAction}
            >
              Add Row
            </button>
          )}
          <GridCsvExportButton>Excel</GridCsvExportButton>
          <GridPdfExportButton>PDF</GridPdfExportButton>
          <GridToolbarSpacer />
          <GridSearchBox placeholder="Search..." />
        </GridToolbar>
      </Grid>
    </div>
  );
}
