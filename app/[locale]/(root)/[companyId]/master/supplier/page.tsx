"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiResponse } from "@/interfaces/auth";
import {
  ISupplier,
  ISupplierAddress,
  ISupplierContact,
  ISupplierFilter,
} from "@/interfaces/supplier";
import {
  SupplierAddressSchemaType,
  SupplierContactSchemaType,
  SupplierSchemaType,
} from "@/schemas/supplier";
import { usePermissionStore } from "@/stores/permission-store";
import { ListFilter, RotateCcw, Save, Trash2 } from "lucide-react";

import { Supplier, SupplierAddress, SupplierContact } from "@/lib/api-routes";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import {
  useDelete,
  useGetById,
  useGetWithPagination,
  usePersist,
} from "@/hooks/use-common";
import { useGetSupplierById } from "@/hooks/use-master";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Badge, Loader } from "@progress/kendo-react-indicators";
import {
  DeleteConfirmation,
  SaveConfirmation,
} from "@/components/ui/confirmation";

import { SupplierAddressForm } from "./components/supplier-address-form";
import { SupplierAddressTable } from "./components/supplier-address-table";
import { SupplierContactForm } from "./components/supplier-contact-form";
import { SupplierContactTable } from "./components/supplier-contact-table";
import SupplierForm from "./components/supplier-form";
import { SupplierTable } from "./components/supplier-table";

export default function SupplierPage() {
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.supplier;

  const { hasPermission } = usePermissionStore();
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");

  const [showListDialog, setShowListDialog] = useState(false);
  const [supplier, setSupplier] = useState<ISupplier | null>(null);
  const [addresses, setAddresses] = useState<ISupplierAddress[]>([]);
  const [contacts, setContacts] = useState<ISupplierContact[]>([]);
  const [activeTab, setActiveTab] = useState<"address" | "contact">("address");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<ISupplierAddress | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<ISupplierContact | null>(null);
  const [addressMode, setAddressMode] = useState<"view" | "edit" | "add">(
    "view",
  );
  const [contactMode, setContactMode] = useState<"view" | "edit" | "add">(
    "view",
  );
  const [filters, setFilters] = useState<ISupplierFilter>({
    search: "",
    sortOrder: "asc",
  });
  const [key, setKey] = useState(0);
  const { defaults } = useUserSettingDefaults();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    defaults?.common?.masterGridTotalRecords || 50,
  );

  useEffect(() => {
    if (defaults?.common?.masterGridTotalRecords) {
      setPageSize(defaults.common.masterGridTotalRecords);
    }
  }, [defaults?.common?.masterGridTotalRecords]);

  const [showSupplierSaveConfirmation, setShowSupplierSaveConfirmation] =
    useState(false);
  const [showAddressSaveConfirmation, setShowAddressSaveConfirmation] =
    useState(false);
  const [showContactSaveConfirmation, setShowContactSaveConfirmation] =
    useState(false);
  const [pendingSupplierData, setPendingSupplierData] =
    useState<SupplierSchemaType | null>(null);
  const [pendingAddressData, setPendingAddressData] =
    useState<SupplierAddressSchemaType | null>(null);
  const [pendingContactData, setPendingContactData] =
    useState<SupplierContactSchemaType | null>(null);

  const [showSupplierDeleteConfirmation, setShowSupplierDeleteConfirmation] =
    useState(false);
  const [showAddressDeleteConfirmation, setShowAddressDeleteConfirmation] =
    useState(false);
  const [showContactDeleteConfirmation, setShowContactDeleteConfirmation] =
    useState(false);
  const [pendingDeleteSupplier, setPendingDeleteSupplier] =
    useState<ISupplier | null>(null);
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState<
    string | null
  >(null);
  const [pendingDeleteContactId, setPendingDeleteContactId] = useState<
    string | null
  >(null);
  const [pendingDeleteAddress, setPendingDeleteAddress] =
    useState<ISupplierAddress | null>(null);
  const [pendingDeleteContact, setPendingDeleteContact] =
    useState<ISupplierContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetAllData = () => {
    setAddresses([]);
    setContacts([]);
    setSelectedAddress(null);
    setSelectedContact(null);
    setShowAddressForm(false);
    setShowContactForm(false);
    setAddressMode("view");
    setContactMode("view");
    setActiveTab("address");
  };

  const {
    data: suppliersResponse,
    refetch: refetchSuppliers,
    isLoading: isLoadingSuppliers,
  } = useGetWithPagination<ISupplier>(
    `${Supplier.get}`,
    "suppliers",
    filters.search,
    currentPage,
    pageSize,
  );

  const { refetch: refetchSupplierDetails } = useGetSupplierById<ISupplier>(
    `${Supplier.getById}`,
    "supplier",
    supplier?.supplierId || 0,
    supplier?.supplierCode || "0",
    supplier?.supplierName || "0",
  );

  const { refetch: refetchAddresses, isLoading: isLoadingAddresses } =
    useGetById<ISupplierAddress>(
      `${SupplierAddress.get}`,
      "supplieraddresses",
      supplier?.supplierId?.toString() || "",
    );

  const { refetch: refetchContacts, isLoading: isLoadingContacts } =
    useGetById<ISupplierContact>(
      `${SupplierContact.get}`,
      "suppliercontacts",
      supplier?.supplierId?.toString() || "",
    );

  const { data: suppliersData, totalRecords } =
    (suppliersResponse as ApiResponse<ISupplier>) ?? {
      result: 0,
      message: "",
      data: [],
      totalRecords: 0,
    };

  const saveMutation = usePersist<SupplierSchemaType>(`${Supplier.add}`);
  const updateMutation = usePersist<SupplierSchemaType>(`${Supplier.add}`);
  const deleteMutation = useDelete(`${Supplier.delete}`);
  const saveAddressMutation = usePersist<SupplierAddressSchemaType>(
    `${SupplierAddress.add}`,
  );
  const updateAddressMutation = usePersist<SupplierAddressSchemaType>(
    `${SupplierAddress.add}`,
  );
  const deleteAddressMutation = useDelete(`${SupplierAddress.delete}`);
  const saveContactMutation = usePersist<SupplierContactSchemaType>(
    `${SupplierContact.add}`,
  );
  const updateContactMutation = usePersist<SupplierContactSchemaType>(
    `${SupplierContact.add}`,
  );
  const deleteContactMutation = useDelete(`${SupplierContact.delete}`);

  const fetchSupplierData = useCallback(async () => {
    try {
      const { data: response } = await refetchSupplierDetails();
      if (response?.result === 1) {
        const detailedSupplier = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null;
        if (detailedSupplier?.supplierId) {
          setSupplier(detailedSupplier as ISupplier);
        }
      }

      const [addressesResponse, contactsResponse] = await Promise.all([
        refetchAddresses(),
        refetchContacts(),
      ]);

      if (addressesResponse?.data?.result === 1)
        setAddresses(addressesResponse.data.data ?? []);
      else setAddresses([]);

      if (contactsResponse?.data?.result === 1)
        setContacts(contactsResponse.data.data ?? []);
      else setContacts([]);
    } catch {
      setAddresses([]);
      setContacts([]);
    }
  }, [refetchSupplierDetails, refetchAddresses, refetchContacts]);

  useEffect(() => {
    if (supplier?.supplierId) {
      fetchSupplierData();
    }
  }, [supplier?.supplierId, fetchSupplierData]);

  const handleSupplierSave = (data: SupplierSchemaType) => {
    setPendingSupplierData(data);
    setShowSupplierSaveConfirmation(true);
  };

  const handleSupplierSaveConfirm = async () => {
    if (!pendingSupplierData) return;

    setIsSaving(true);
    try {
      const response =
        pendingSupplierData.supplierId === 0
          ? await saveMutation.mutateAsync(pendingSupplierData)
          : await updateMutation.mutateAsync(pendingSupplierData);

      if (response.result === 1) {
        const supplierData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setSupplier(supplierData as ISupplier);
        refetchSuppliers();
      }
    } catch {
      // error handled by mutation
    } finally {
      setIsSaving(false);
      setPendingSupplierData(null);
      setShowSupplierSaveConfirmation(false);
    }
  };

  const handleSupplierReset = () => {
    setSupplier(null);
    resetAllData();
    setKey((prev) => prev + 1);
  };

  const handleSupplierSelect = (selected: ISupplier | null) => {
    if (selected) {
      resetAllData();
      setSupplier(selected);
      setShowListDialog(false);
    }
  };

  const handleSupplierDelete = () => {
    if (!supplier) return;
    setPendingDeleteSupplier(supplier);
    setShowSupplierDeleteConfirmation(true);
  };

  const handleSupplierDeleteConfirm = async () => {
    if (!pendingDeleteSupplier) return;

    try {
      const response = await deleteMutation.mutateAsync(
        pendingDeleteSupplier.supplierId.toString(),
      );
      if (response.result === 1) {
        setSupplier(null);
        setAddresses([]);
        setContacts([]);
        refetchSuppliers();
      }
    } finally {
      setPendingDeleteSupplier(null);
      setShowSupplierDeleteConfirmation(false);
    }
  };

  const handleAddressSave = (data: SupplierAddressSchemaType) => {
    setPendingAddressData(data);
    setShowAddressSaveConfirmation(true);
  };

  const handleAddressSaveConfirm = async () => {
    if (!pendingAddressData) return;

    try {
      const response =
        pendingAddressData.addressId === 0
          ? await saveAddressMutation.mutateAsync({
              ...pendingAddressData,
              supplierId: supplier?.supplierId || 0,
            })
          : await updateAddressMutation.mutateAsync(pendingAddressData);

      if (response.result === 1) {
        const refreshed = await refetchAddresses();
        if (refreshed?.data?.result === 1)
          setAddresses(refreshed.data.data ?? []);
        setShowAddressForm(false);
        setSelectedAddress(null);
      }
    } finally {
      setPendingAddressData(null);
      setShowAddressSaveConfirmation(false);
    }
  };

  const handleContactSave = (data: SupplierContactSchemaType) => {
    setPendingContactData(data);
    setShowContactSaveConfirmation(true);
  };

  const handleContactSaveConfirm = async () => {
    if (!pendingContactData) return;

    try {
      const response =
        pendingContactData.contactId === 0
          ? await saveContactMutation.mutateAsync({
              ...pendingContactData,
              supplierId: supplier?.supplierId || 0,
            })
          : await updateContactMutation.mutateAsync(pendingContactData);

      if (response.result === 1) {
        const refreshed = await refetchContacts();
        if (refreshed?.data?.result === 1)
          setContacts(refreshed.data.data ?? []);
        setShowContactForm(false);
        setSelectedContact(null);
      }
    } finally {
      setPendingContactData(null);
      setShowContactSaveConfirmation(false);
    }
  };

  const handleAddressSelect = (address: ISupplierAddress | null) => {
    if (address) {
      setSelectedAddress(address);
      setAddressMode("view");
      setShowAddressForm(true);
    }
  };

  const handleContactSelect = (contact: ISupplierContact | null) => {
    if (contact) {
      setSelectedContact(contact);
      setContactMode("view");
      setShowContactForm(true);
    }
  };

  const handleAddressEdit = (address: ISupplierAddress | null) => {
    if (address) {
      setSelectedAddress(address);
      setAddressMode("edit");
      setShowAddressForm(true);
    }
  };

  const handleContactEdit = (contact: ISupplierContact | null) => {
    if (contact) {
      setSelectedContact(contact);
      setContactMode("edit");
      setShowContactForm(true);
    }
  };

  const handleAddressAdd = () => {
    setSelectedAddress(null);
    setAddressMode("add");
    setShowAddressForm(true);
  };

  const handleContactAdd = () => {
    setSelectedContact(null);
    setContactMode("add");
    setShowContactForm(true);
  };

  const handleAddressDelete = async (addressId: string) => {
    const addressToDelete = addresses.find(
      (addr) => addr.addressId.toString() === addressId,
    );
    setPendingDeleteAddressId(addressId);
    setPendingDeleteAddress(addressToDelete || null);
    setShowAddressDeleteConfirmation(true);
  };

  const handleAddressDeleteConfirm = async () => {
    if (!pendingDeleteAddressId || !supplier?.supplierId) return;

    try {
      const response = await deleteAddressMutation.mutateAsync(
        `${supplier.supplierId}/${pendingDeleteAddressId}`,
      );
      if (response.result === 1) {
        const refreshed = await refetchAddresses();
        if (refreshed?.data?.result === 1)
          setAddresses(refreshed.data.data ?? []);
      }
    } finally {
      setPendingDeleteAddressId(null);
      setPendingDeleteAddress(null);
      setShowAddressDeleteConfirmation(false);
    }
  };

  const handleContactDelete = async (contactId: string) => {
    const contactToDelete = contacts.find(
      (c) => c.contactId.toString() === contactId,
    );
    setPendingDeleteContactId(contactId);
    setPendingDeleteContact(contactToDelete || null);
    setShowContactDeleteConfirmation(true);
  };

  const handleContactDeleteConfirm = async () => {
    if (!pendingDeleteContactId || !supplier?.supplierId) return;

    try {
      const response = await deleteContactMutation.mutateAsync(
        `${supplier.supplierId}/${pendingDeleteContactId}`,
      );
      if (response.result === 1) {
        const refreshed = await refetchContacts();
        if (refreshed?.data?.result === 1)
          setContacts(refreshed.data.data ?? []);
      }
    } finally {
      setPendingDeleteContactId(null);
      setPendingDeleteContact(null);
      setShowContactDeleteConfirmation(false);
    }
  };

  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ISupplierFilter);
      setCurrentPage(1);
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const isEdit = Boolean(supplier?.supplierId && supplier.supplierId > 0);

  return (
    <div className="@container mx-auto space-y-1.5 px-4 pt-2 pb-4 sm:space-y-2 sm:px-6 sm:pt-3 sm:pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Supplier
          </h1>
          <p className="text-muted-foreground text-xs">
            Manage supplier information, addresses, and contacts
          </p>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-1.5">
          <Button
            fillMode="outline"
            size="small"
            startIcon={<ListFilter className="h-4 w-4" />}
            onClick={() => setShowListDialog(true)}
            className="w-full sm:w-auto"
          >
            List
          </Button>
          <Button
            themeColor={isEdit ? "primary" : undefined}
            size="small"
            startIcon={
              isSaving ||
              saveMutation.isPending ||
              updateMutation.isPending ? (
                <Loader type="converging-spinner" size="small" />
              ) : (
                <Save className="h-4 w-4" />
              )
            }
            onClick={() =>
              document.getElementById("supplier-form-submit")?.click()
            }
            disabled={
              isSaving ||
              saveMutation.isPending ||
              updateMutation.isPending ||
              (isEdit ? !canEdit : !canCreate)
            }
            className={
              isEdit
                ? "bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                : "w-full sm:w-auto"
            }
          >
            {isSaving || saveMutation.isPending || updateMutation.isPending
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update"
                : "Save"}
          </Button>
          <Button
            fillMode="outline"
            size="small"
            startIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleSupplierReset}
            disabled={!supplier}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            themeColor="error"
            size="small"
            startIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleSupplierDelete}
            disabled={!supplier}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      </div>

      <hr className="border-border my-2" />

      <div className="flex flex-col gap-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <SupplierForm
            key={key}
            initialData={supplier || undefined}
            onSaveAction={handleSupplierSave}
          />
        </div>

        {supplier && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-3 flex gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
              <Button
                fillMode={activeTab === "address" ? "solid" : "flat"}
                themeColor={activeTab === "address" ? "primary" : "secondary"}
                onClick={() => setActiveTab("address")}
              >
                <span className="flex items-center gap-2">
                  Addresses
                  <Badge themeColor="secondary" fillMode="solid" size="small">
                    {addresses.length}
                  </Badge>
                </span>
              </Button>
              <Button
                fillMode={activeTab === "contact" ? "solid" : "flat"}
                themeColor={activeTab === "contact" ? "primary" : "secondary"}
                onClick={() => setActiveTab("contact")}
              >
                <span className="flex items-center gap-2">
                  Contacts
                  <Badge themeColor="secondary" fillMode="solid" size="small">
                    {contacts.length}
                  </Badge>
                </span>
              </Button>
            </div>
            <div className="min-w-0 w-full overflow-x-auto">
              {activeTab === "address" && (
                <SupplierAddressTable
                  key={`address-${supplier?.supplierId ?? "new"}`}
                  data={addresses}
                  isLoading={isLoadingAddresses}
                  onSelect={canView ? handleAddressSelect : undefined}
                  onDeleteAction={canDelete ? handleAddressDelete : undefined}
                  onEditAction={canEdit ? handleAddressEdit : undefined}
                  onCreateAction={canCreate ? handleAddressAdd : undefined}
                  onRefreshAction={() => refetchAddresses()}
                  moduleId={moduleId}
                  transactionId={transactionId}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canView={canView}
                  canCreate={canCreate}
                />
              )}
              {activeTab === "contact" && (
                <SupplierContactTable
                  key={`contact-${supplier?.supplierId ?? "new"}`}
                  data={contacts}
                  isLoading={isLoadingContacts}
                  onSelect={canView ? handleContactSelect : undefined}
                  onDeleteAction={canDelete ? handleContactDelete : undefined}
                  onEditAction={canEdit ? handleContactEdit : undefined}
                  onCreateAction={canCreate ? handleContactAdd : undefined}
                  onRefreshAction={() => refetchContacts()}
                  moduleId={moduleId}
                  transactionId={transactionId}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canView={canView}
                  canCreate={canCreate}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showListDialog && (
        <Dialog
          title="Supplier List"
          onClose={() => setShowListDialog(false)}
          width="92vw"
          height="92vh"
          className="max-w-none!"
        >
          <p className="text-muted-foreground mb-2 text-sm">
            Manage and select existing suppliers from the list below. Use search
            to filter records or create new suppliers.
          </p>
          <div className="flex min-h-0 flex-col">
            <SupplierTable
              data={suppliersData ?? []}
              isLoading={isLoadingSuppliers}
              totalRecords={totalRecords ?? 0}
              onSelect={handleSupplierSelect}
              onFilterChange={handleFilterChange}
              initialSearchValue={filters.search}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              currentPage={currentPage}
              pageSize={pageSize}
              serverSidePagination
              onRefreshAction={() => refetchSuppliers()}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          </div>
        </Dialog>
      )}

      {showAddressForm && (
        <Dialog
          title={
            addressMode === "view"
              ? "View Address"
              : addressMode === "edit"
                ? "Edit Address"
                : "Add Address"
          }
          onClose={() => {
            setShowAddressForm(false);
            setSelectedAddress(null);
            setAddressMode("view");
          }}
          width="70vw"
          height="85vh"
          className="max-w-none!"
        >
          <p className="text-muted-foreground mb-4 text-sm">
            {addressMode === "view"
              ? "View supplier address details."
              : "Manage supplier address details."}
          </p>
          <hr className="border-border my-2" />
          {supplier?.supplierId && supplier.supplierId > 0 && (
            <SupplierAddressForm
              key={`address-form-${selectedAddress?.addressId ?? "new"}-${addressMode}`}
              initialData={
                addressMode === "edit" || addressMode === "view"
                  ? selectedAddress ?? undefined
                  : undefined
              }
              supplierId={supplier.supplierId}
              submitAction={handleAddressSave}
              onCancelAction={() => {
                setShowAddressForm(false);
                setSelectedAddress(null);
                setAddressMode("view");
              }}
              isSubmitting={
                saveAddressMutation.isPending ||
                updateAddressMutation.isPending
              }
              isReadOnly={addressMode === "view"}
            />
          )}
        </Dialog>
      )}

      {showContactForm && (
        <Dialog
          title={
            contactMode === "view"
              ? "View Contact"
              : contactMode === "edit"
                ? "Edit Contact"
                : "Add Contact"
          }
          onClose={() => {
            setShowContactForm(false);
            setSelectedContact(null);
            setContactMode("view");
          }}
          width="70vw"
          height="85vh"
          className="max-w-none!"
        >
          <p className="text-muted-foreground mb-4 text-sm">
            {contactMode === "view"
              ? "View supplier contact details."
              : "Manage supplier contact details."}
          </p>
          <hr className="border-border my-2" />
          {supplier?.supplierId && supplier.supplierId > 0 && (
            <SupplierContactForm
              key={`contact-form-${selectedContact?.contactId ?? "new"}-${contactMode}`}
              initialData={
                contactMode === "edit" || contactMode === "view"
                  ? selectedContact ?? undefined
                  : undefined
              }
              supplierId={supplier.supplierId}
              submitAction={handleContactSave}
              onCancelAction={() => {
                setShowContactForm(false);
                setSelectedContact(null);
                setContactMode("view");
              }}
              isSubmitting={
                saveContactMutation.isPending ||
                updateContactMutation.isPending
              }
              isReadOnly={contactMode === "view"}
            />
          )}
        </Dialog>
      )}

      <SaveConfirmation
        open={showSupplierSaveConfirmation}
        onOpenChange={setShowSupplierSaveConfirmation}
        onConfirm={handleSupplierSaveConfirm}
        onCancelAction={() => {
          setPendingSupplierData(null);
          setShowSupplierSaveConfirmation(false);
        }}
        title="Save Supplier"
        itemName={pendingSupplierData?.supplierName ?? "Supplier"}
        operationType={
          pendingSupplierData?.supplierId === 0 ? "create" : "update"
        }
        isSaving={saveMutation.isPending || updateMutation.isPending}
      />

      <SaveConfirmation
        open={showAddressSaveConfirmation}
        onOpenChange={setShowAddressSaveConfirmation}
        onConfirm={handleAddressSaveConfirm}
        onCancelAction={() => {
          setPendingAddressData(null);
          setShowAddressSaveConfirmation(false);
        }}
        title="Save Address"
        itemName={pendingAddressData?.address1 ?? "Address"}
        operationType={
          pendingAddressData?.addressId === 0 ? "create" : "update"
        }
        isSaving={
          saveAddressMutation.isPending || updateAddressMutation.isPending
        }
      />

      <SaveConfirmation
        open={showContactSaveConfirmation}
        onOpenChange={setShowContactSaveConfirmation}
        onConfirm={handleContactSaveConfirm}
        onCancelAction={() => {
          setPendingContactData(null);
          setShowContactSaveConfirmation(false);
        }}
        title="Save Contact"
        itemName={pendingContactData?.contactName ?? "Contact"}
        operationType={
          pendingContactData?.contactId === 0 ? "create" : "update"
        }
        isSaving={
          saveContactMutation.isPending || updateContactMutation.isPending
        }
      />

      <DeleteConfirmation
        open={showSupplierDeleteConfirmation}
        onOpenChange={setShowSupplierDeleteConfirmation}
        onConfirm={handleSupplierDeleteConfirm}
        onCancelAction={() => {
          setPendingDeleteSupplier(null);
          setShowSupplierDeleteConfirmation(false);
        }}
        title="Delete Supplier"
        itemName={pendingDeleteSupplier?.supplierName ?? "Supplier"}
        isDeleting={deleteMutation.isPending}
      />

      <DeleteConfirmation
        open={showAddressDeleteConfirmation}
        onOpenChange={setShowAddressDeleteConfirmation}
        onConfirm={handleAddressDeleteConfirm}
        onCancelAction={() => {
          setPendingDeleteAddressId(null);
          setPendingDeleteAddress(null);
          setShowAddressDeleteConfirmation(false);
        }}
        title="Delete Address"
        itemName={pendingDeleteAddress?.address1 ?? "Address"}
        isDeleting={deleteAddressMutation.isPending}
      />

      <DeleteConfirmation
        open={showContactDeleteConfirmation}
        onOpenChange={setShowContactDeleteConfirmation}
        onConfirm={handleContactDeleteConfirm}
        onCancelAction={() => {
          setPendingDeleteContactId(null);
          setPendingDeleteContact(null);
          setShowContactDeleteConfirmation(false);
        }}
        title="Delete Contact"
        itemName={pendingDeleteContact?.contactName ?? "Contact"}
        isDeleting={deleteContactMutation.isPending}
      />
    </div>
  );
}
