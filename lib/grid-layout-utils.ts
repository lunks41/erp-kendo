import type { GridColumnState } from "@progress/kendo-react-grid"
import type { IGridSetting } from "@/interfaces/setting"

export type GridLayoutLike = Partial<Pick<IGridSetting, "grdColOrder" | "grdColVisible" | "grdColSize">>

/** Normalize layout keys (API may return GrdColVisible vs grdColVisible) */
export function normalizeLayout(
  raw: unknown,
  tableName?: string
): GridLayoutLike | null {
  if (!raw || typeof raw !== "object") return null
  let o: Record<string, unknown>
  if (Array.isArray(raw)) {
    const found = tableName
      ? (raw as Record<string, unknown>[]).find(
          (item) =>
            item?.grdName === tableName ||
            item?.grdKey === tableName ||
            (item as Record<string, unknown>)?.GrdName === tableName ||
            (item as Record<string, unknown>)?.GrdKey === tableName
        )
      : raw[0]
    o = (found ?? raw[0]) as Record<string, unknown>
  } else {
    o = raw as Record<string, unknown>
  }
  if (!o || typeof o !== "object") return null
  const get = (key: string) =>
    o[key] ?? o[key.charAt(0).toUpperCase() + key.slice(1)]
  const grdColOrder = get("grdColOrder")
  const grdColVisible = get("grdColVisible")
  const grdColSize = get("grdColSize")
  if (!grdColOrder && !grdColVisible && !grdColSize) return null
  return {
    grdColOrder: typeof grdColOrder === "string" ? grdColOrder : "",
    grdColVisible: typeof grdColVisible === "string" ? grdColVisible : "",
    grdColSize: typeof grdColSize === "string" ? grdColSize : "",
  }
}

/** Use JSON key-value format when saving layout. If false, uses comma-separated. */
export const LAYOUT_USE_JSON_FORMAT = true

/** Normalize actions field: backend may store _actions or actions, we use __actions */
function normalizeField(field: string): string {
  const t = field.trim()
  if (t === "_actions" || t === "actions") return "__actions"
  return t
}

/** Denormalize for saving: __actions -> actions (cleaner JSON keys) */
function denormalizeField(field: string): string {
  return field === "__actions" ? "actions" : field
}

function tryParseJson<T>(str: string | undefined): T | null {
  if (!str?.trim()) return null
  const s = str.trim()
  if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
    try {
      return JSON.parse(s) as T
    } catch {
      return null
    }
  }
  return null
}

/**
 * Parse backend grid layout (grdColOrder, grdColVisible, grdColSize)
 * into Kendo Grid columnsState format.
 *
 * Supports both formats:
 * - JSON: grdColOrder=["field1","field2"], grdColVisible={"field1":true}, grdColSize={"field1":120}
 * - Comma/dot: grdColOrder="field1,field2", grdColVisible="1,0", grdColSize="120,200"
 */
export function parseGridLayoutToColumnsState(
  layout: GridLayoutLike | undefined | null,
  baseColumnFields: string[]
): GridColumnState[] | undefined {
  const visibleStr = layout?.grdColVisible ?? ""
  const visibleJson = tryParseJson<Record<string, boolean>>(visibleStr)
  const sizeStr = layout?.grdColSize ?? ""
  const sizeJson = tryParseJson<Record<string, number>>(sizeStr)

  let orderFields: string[]

  const orderStr = layout?.grdColOrder?.trim()
  if (orderStr) {
    const orderJson = tryParseJson<string[]>(orderStr)
    orderFields = orderJson
      ? orderJson.map((s) => normalizeField(String(s))).filter(Boolean)
      : orderStr
          .split(/[,.]/)
          .map((s) => normalizeField(s))
          .filter(Boolean)
  } else if (visibleJson && typeof visibleJson === "object") {
    // grdColOrder missing but grdColVisible is JSON - derive order from keys
    orderFields = Object.keys(visibleJson).map((k) => normalizeField(k)).filter(Boolean)
    // Ensure base columns not in visibleJson are appended
    baseColumnFields.forEach((f) => {
      const n = normalizeField(f)
      if (!orderFields.includes(n)) orderFields.push(n)
    })
  } else {
    return undefined
  }

  if (orderFields.length === 0) return undefined

  const stateMap = new Map<string, GridColumnState>()
  orderFields.forEach((field, idx) => {
    let visible = true
    let width: number | undefined

    if (visibleJson && typeof visibleJson === "object") {
      const key = field === "__actions" ? "actions" : field
      visible = visibleJson[key] ?? visibleJson[field] ?? true
    } else {
      const visibleArr = visibleStr.split(",").map((s) => s.trim())
      const v = visibleArr[idx] ?? "1"
      visible = v === "1" || v.toLowerCase() === "true"
    }

    if (sizeJson && typeof sizeJson === "object") {
      const key = field === "__actions" ? "actions" : field
      const w = sizeJson[key] ?? sizeJson[field]
      width = typeof w === "number" && Number.isFinite(w) ? w : undefined
    } else {
      const sizeArr = sizeStr.split(",").map((s) => s.trim())
      const w = sizeArr[idx] ? parseInt(sizeArr[idx], 10) : NaN
      width = Number.isFinite(w) ? w : undefined
    }

    stateMap.set(field, {
      id: field,
      field,
      hidden: !visible,
      orderIndex: idx,
      ...(Number.isFinite(width) ? { width } : {}),
    })
  })

  baseColumnFields.forEach((field) => {
    if (!stateMap.has(field)) {
      stateMap.set(field, {
        id: field,
        field,
        hidden: false,
        orderIndex: stateMap.size,
      })
    }
  })

  // Return only columns that exist in baseColumnFields (match rendered GridColumns)
  const baseSet = new Set(baseColumnFields)
  return Array.from(stateMap.values()).filter(
    (col) => baseSet.has(col.field ?? col.id ?? "")
  )
}

/**
 * Serialize Kendo Grid columnsState to backend layout format.
 * Uses JSON key-value format when LAYOUT_USE_JSON_FORMAT is true.
 */
export function serializeColumnsStateToLayout(
  columnsState: GridColumnState[]
): Pick<IGridSetting, "grdColOrder" | "grdColVisible" | "grdColSize"> {
  const ordered = [...columnsState].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))

  if (LAYOUT_USE_JSON_FORMAT) {
    const grdColOrder = JSON.stringify(
      ordered.map((c) => denormalizeField(c.field ?? c.id ?? "")).filter(Boolean)
    )
    const grdColVisible = JSON.stringify(
      Object.fromEntries(
        ordered
          .filter((c) => (c.field ?? c.id) !== "")
          .map((c) => [denormalizeField(c.field ?? c.id ?? ""), !c.hidden])
      )
    )
    const grdColSize = JSON.stringify(
      Object.fromEntries(
        ordered
          .filter((c) => (c.field ?? c.id) !== "")
          .map((c) => {
            const f = denormalizeField(c.field ?? c.id ?? "")
            const w =
              typeof c.width === "number"
                ? c.width
                : c.width
                  ? parseInt(String(c.width), 10)
                  : 120
            return [f, Number.isFinite(w) ? w : 120]
          })
      )
    )
    return { grdColOrder, grdColVisible, grdColSize }
  }

  const grdColOrder = ordered
    .map((c) => denormalizeField(c.field ?? c.id ?? ""))
    .filter(Boolean)
    .join(",")
  const grdColVisible = ordered.map((c) => (c.hidden ? "0" : "1")).join(",")
  const grdColSize = ordered
    .map((c) => (typeof c.width === "number" ? c.width : c.width ? parseInt(String(c.width), 10) : ""))
    .map((w) => (Number.isFinite(w) ? w : ""))
    .join(",")

  return { grdColOrder, grdColVisible, grdColSize }
}
