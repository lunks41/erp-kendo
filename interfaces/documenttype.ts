export interface IDocumentType {
  documentTypeId: number
  companyId: number
  documentTypeCode: string
  documentTypeName: string
  createBy: string
  editBy: string | null
  createDate: Date | string
  editDate: Date | string
  isActive: boolean
  remarks: string
}

export interface IDocumentTypeFilter {
  isActive?: boolean
  search?: string
  sortOrder?: "asc" | "desc"
}
