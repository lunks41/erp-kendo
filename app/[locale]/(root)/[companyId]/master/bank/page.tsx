"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiResponse } from "@/interfaces/auth";
import {
  IBank,
  IBankAddress,
  IBankContact,
  IBankFilter,
} from "@/interfaces/bank";
import {
  BankAddressSchemaType,
  BankContactSchemaType,
  BankSchemaType,
} from "@/schemas/bank";
import { usePermissionStore } from "@/stores/permission-store";
import { ListFilter, RotateCcw, Save, Trash2 } from "lucide-react";

import { Bank, BankAddress, BankContact } from "@/lib/api-routes";
import { MasterTransactionId, ModuleId } from "@/lib/utils";
import {
  useDelete,
  useGetById,
  useGetWithPagination,
  usePersist,
} from "@/hooks/use-common";
import { useGetBankById } from "@/hooks/use-master";
import { useUserSettingDefaults } from "@/hooks/use-settings";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Badge, Loader } from "@progress/kendo-react-indicators";
import {
  DeleteConfirmation,
  SaveConfirmation,
} from "@/components/ui/confirmation";

import { BankAddressForm } from "./components/bank-address-form";
import { BankAddressTable } from "./components/bank-address-table";
import { BankContactForm } from "./components/bank-contact-form";
import { BankContactTable } from "./components/bank-contact-table";
import BankForm from "./components/bank-form";
import { BankTable } from "./components/bank-table";

export default function BankPage() {
  const moduleId = ModuleId.master;
  const transactionId = MasterTransactionId.bank;

  const { hasPermission } = usePermissionStore();
  const canCreate = hasPermission(moduleId, transactionId, "isCreate");
  const canView = hasPermission(moduleId, transactionId, "isRead");
  const canEdit = hasPermission(moduleId, transactionId, "isEdit");
  const canDelete = hasPermission(moduleId, transactionId, "isDelete");

  const [showListDialog, setShowListDialog] = useState(false);
  const [bank, setBank] = useState<IBank | null>(null);
  const [addresses, setAddresses] = useState<IBankAddress[]>([]);
  const [contacts, setContacts] = useState<IBankContact[]>([]);
  const [activeTab, setActiveTab] = useState<"address" | "contact">("address");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IBankAddress | null>(
    null,
  );
  const [selectedContact, setSelectedContact] = useState<IBankContact | null>(
    null,
  );
  const [addressMode, setAddressMode] = useState<"view" | "edit" | "add">(
    "view",
  );
  const [contactMode, setContactMode] = useState<"view" | "edit" | "add">(
    "view",
  );
  const [filters, setFilters] = useState<IBankFilter>({
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

  const [showBankSaveConfirmation, setShowBankSaveConfirmation] =
    useState(false);
  const [showAddressSaveConfirmation, setShowAddressSaveConfirmation] =
    useState(false);
  const [showContactSaveConfirmation, setShowContactSaveConfirmation] =
    useState(false);
  const [pendingBankData, setPendingBankData] =
    useState<BankSchemaType | null>(null);
  const [pendingAddressData, setPendingAddressData] =
    useState<BankAddressSchemaType | null>(null);
  const [pendingContactData, setPendingContactData] =
    useState<BankContactSchemaType | null>(null);

  const [showBankDeleteConfirmation, setShowBankDeleteConfirmation] =
    useState(false);
  const [showAddressDeleteConfirmation, setShowAddressDeleteConfirmation] =
    useState(false);
  const [showContactDeleteConfirmation, setShowContactDeleteConfirmation] =
    useState(false);
  const [pendingDeleteBank, setPendingDeleteBank] = useState<IBank | null>(
    null,
  );
  const [pendingDeleteAddressId, setPendingDeleteAddressId] = useState<
    string | null
  >(null);
  const [pendingDeleteContactId, setPendingDeleteContactId] = useState<
    string | null
  >(null);
  const [pendingDeleteAddress, setPendingDeleteAddress] =
    useState<IBankAddress | null>(null);
  const [pendingDeleteContact, setPendingDeleteContact] =
    useState<IBankContact | null>(null);
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
    data: banksResponse,
    refetch: refetchBanks,
    isLoading: isLoadingBanks,
  } = useGetWithPagination<IBank>(
    `${Bank.get}`,
    "banks",
    filters.search,
    currentPage,
    pageSize,
  );

  const { refetch: refetchBankDetails } = useGetBankById<IBank>(
    `${Bank.getById}`,
    "bank",
    bank?.bankId || 0,
    bank?.bankCode || "0",
    bank?.bankName || "0",
  );

  const { refetch: refetchAddresses, isLoading: isLoadingAddresses } =
    useGetById<IBankAddress>(
      `${BankAddress.get}`,
      "bankaddresses",
      bank?.bankId?.toString() || "",
    );

  const { refetch: refetchContacts, isLoading: isLoadingContacts } =
    useGetById<IBankContact>(
      `${BankContact.get}`,
      "bankcontacts",
      bank?.bankId?.toString() || "",
    );

  const { data: banksData, totalRecords } =
    (banksResponse as ApiResponse<IBank>) ?? {
      result: 0,
      message: "",
      data: [],
      totalRecords: 0,
    };

  const saveMutation = usePersist<BankSchemaType>(`${Bank.add}`);
  const updateMutation = usePersist<BankSchemaType>(`${Bank.add}`);
  const deleteMutation = useDelete(`${Bank.delete}`);
  const saveAddressMutation = usePersist<BankAddressSchemaType>(
    `${BankAddress.add}`,
  );
  const updateAddressMutation = usePersist<BankAddressSchemaType>(
    `${BankAddress.add}`,
  );
  const deleteAddressMutation = useDelete(`${BankAddress.delete}`);
  const saveContactMutation = usePersist<BankContactSchemaType>(
    `${BankContact.add}`,
  );
  const updateContactMutation = usePersist<BankContactSchemaType>(
    `${BankContact.add}`,
  );
  const deleteContactMutation = useDelete(`${BankContact.delete}`);

  const fetchBankData = useCallback(async () => {
    try {
      const { data: response } = await refetchBankDetails();
      if (response?.result === 1) {
        const detailedBank = Array.isArray(response.data)
          ? response.data[0] || null
          : response.data || null;
        if (detailedBank?.bankId) {
          setBank(detailedBank as IBank);
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
  }, [refetchBankDetails, refetchAddresses, refetchContacts]);

  useEffect(() => {
    if (bank?.bankId) {
      fetchBankData();
    }
  }, [bank?.bankId, fetchBankData]);

  const handleBankSave = (data: BankSchemaType) => {
    setPendingBankData(data);
    setShowBankSaveConfirmation(true);
  };

  const handleBankSaveConfirm = async () => {
    if (!pendingBankData) return;

    setIsSaving(true);
    try {
      const response =
        pendingBankData.bankId === 0
          ? await saveMutation.mutateAsync(pendingBankData)
          : await updateMutation.mutateAsync(pendingBankData);

      if (response.result === 1) {
        const bankData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setBank(bankData as IBank);
        refetchBanks();
      }
    } catch {
      // error handled by mutation
    } finally {
      setIsSaving(false);
      setPendingBankData(null);
      setShowBankSaveConfirmation(false);
    }
  };

  const handleBankReset = () => {
    setBank(null);
    resetAllData();
    setKey((prev) => prev + 1);
  };

  const handleBankSelect = (selected: IBank | null) => {
    if (selected) {
      resetAllData();
      setBank(selected);
      setShowListDialog(false);
    }
  };

  const handleBankDelete = () => {
    if (!bank) return;
    setPendingDeleteBank(bank);
    setShowBankDeleteConfirmation(true);
  };

  const handleBankDeleteConfirm = async () => {
    if (!pendingDeleteBank) return;

    try {
      const response = await deleteMutation.mutateAsync(
        pendingDeleteBank.bankId.toString(),
      );
      if (response.result === 1) {
        setBank(null);
        setAddresses([]);
        setContacts([]);
        refetchBanks();
      }
    } finally {
      setPendingDeleteBank(null);
      setShowBankDeleteConfirmation(false);
    }
  };

  const handleAddressSave = (data: BankAddressSchemaType) => {
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
              bankId: bank?.bankId || 0,
            })
          : await updateAddressMutation.mutateAsync(pendingAddressData);

      if (response.result === 1) {
        const refreshed = await refetchAddresses();
        if (refreshed?.data?.result === 1) setAddresses(refreshed.data.data ?? []);
        setShowAddressForm(false);
        setSelectedAddress(null);
      }
    } finally {
      setPendingAddressData(null);
      setShowAddressSaveConfirmation(false);
    }
  };

  const handleContactSave = (data: BankContactSchemaType) => {
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
              bankId: bank?.bankId || 0,
            })
          : await updateContactMutation.mutateAsync(pendingContactData);

      if (response.result === 1) {
        const refreshed = await refetchContacts();
        if (refreshed?.data?.result === 1) setContacts(refreshed.data.data ?? []);
        setShowContactForm(false);
        setSelectedContact(null);
      }
    } finally {
      setPendingContactData(null);
      setShowContactSaveConfirmation(false);
    }
  };

  const handleAddressSelect = (address: IBankAddress | null) => {
    if (address) {
      setSelectedAddress(address);
      setAddressMode("view");
      setShowAddressForm(true);
    }
  };

  const handleContactSelect = (contact: IBankContact | null) => {
    if (contact) {
      setSelectedContact(contact);
      setContactMode("view");
      setShowContactForm(true);
    }
  };

  const handleAddressEdit = (address: IBankAddress | null) => {
    if (address) {
      setSelectedAddress(address);
      setAddressMode("edit");
      setShowAddressForm(true);
    }
  };

  const handleContactEdit = (contact: IBankContact | null) => {
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
    if (!pendingDeleteAddressId || !bank?.bankId) return;

    try {
      const response = await deleteAddressMutation.mutateAsync(
        `${bank.bankId}/${pendingDeleteAddressId}`,
      );
      if (response.result === 1) {
        const refreshed = await refetchAddresses();
        if (refreshed?.data?.result === 1) setAddresses(refreshed.data.data ?? []);
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
    if (!pendingDeleteContactId || !bank?.bankId) return;

    try {
      const response = await deleteContactMutation.mutateAsync(
        `${bank.bankId}/${pendingDeleteContactId}`,
      );
      if (response.result === 1) {
        const refreshed = await refetchContacts();
        if (refreshed?.data?.result === 1) setContacts(refreshed.data.data ?? []);
      }
    } finally {
      setPendingDeleteContactId(null);
      setPendingDeleteContact(null);
      setShowContactDeleteConfirmation(false);
    }
  };

  const handleFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as IBankFilter);
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

  const isEdit = Boolean(bank?.bankId && bank.bankId > 0);

  return (
    <div className="@container mx-auto space-y-1.5 px-4 pt-2 pb-4 sm:space-y-2 sm:px-6 sm:pt-3 sm:pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Bank</h1>
          <p className="text-muted-foreground text-xs">
            Manage bank information, addresses, and contacts
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
              isSaving || saveMutation.isPending || updateMutation.isPending ? (
                <Loader type="converging-spinner" size="small" />
              ) : (
                <Save className="h-4 w-4" />
              )
            }
            onClick={() =>
              document.getElementById("bank-form-submit")?.click()
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
            onClick={handleBankReset}
            disabled={!bank}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            themeColor="error"
            size="small"
            startIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleBankDelete}
            disabled={!bank}
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      </div>

      <hr className="border-border my-2" />

      <div className="flex flex-col gap-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <BankForm
            key={key}
            initialData={bank || undefined}
            onSaveAction={handleBankSave}
          />
        </div>

        {bank && (
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
                <BankAddressTable
                  key={`address-${bank?.bankId ?? "new"}`}
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
                <BankContactTable
                  key={`contact-${bank?.bankId ?? "new"}`}
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
          title="Bank List"
          onClose={() => setShowListDialog(false)}
          width="92vw"
          height="92vh"
          className="max-w-none!"
        >
          <p className="text-muted-foreground mb-2 text-sm">
            Manage and select existing banks from the list below. Use search to
            filter records or create new banks.
          </p>
          <div className="flex min-h-0 flex-col">
            <BankTable
              data={banksData ?? []}
              isLoading={isLoadingBanks}
              totalRecords={totalRecords ?? 0}
              onSelect={handleBankSelect}
              onFilterChange={handleFilterChange}
              initialSearchValue={filters.search}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              currentPage={currentPage}
              pageSize={pageSize}
              serverSidePagination
              onRefreshAction={() => refetchBanks()}
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
              ? "View bank address details."
              : "Manage bank address details."}
          </p>
          <hr className="border-border my-2" />
          {bank?.bankId && bank.bankId > 0 && (
            <BankAddressForm
              key={`address-form-${selectedAddress?.addressId ?? "new"}-${addressMode}`}
              initialData={
                addressMode === "edit" || addressMode === "view"
                  ? selectedAddress ?? undefined
                  : undefined
              }
              bankId={bank.bankId}
              submitAction={handleAddressSave}
              onCancelAction={() => {
                setShowAddressForm(false);
                setSelectedAddress(null);
                setAddressMode("view");
              }}
              isSubmitting={
                saveAddressMutation.isPending || updateAddressMutation.isPending
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
              ? "View bank contact details."
              : "Manage bank contact details."}
          </p>
          <hr className="border-border my-2" />
          {bank?.bankId && bank.bankId > 0 && (
            <BankContactForm
              key={`contact-form-${selectedContact?.contactId ?? "new"}-${contactMode}`}
              initialData={
                contactMode === "edit" || contactMode === "view"
                  ? selectedContact ?? undefined
                  : undefined
              }
              bankId={bank.bankId}
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
        open={showBankSaveConfirmation}
        onOpenChange={setShowBankSaveConfirmation}
        onConfirm={handleBankSaveConfirm}
        onCancelAction={() => {
          setPendingBankData(null);
          setShowBankSaveConfirmation(false);
        }}
        title="Save Bank"
        itemName={pendingBankData?.bankName ?? "Bank"}
        operationType={pendingBankData?.bankId === 0 ? "create" : "update"}
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
        open={showBankDeleteConfirmation}
        onOpenChange={setShowBankDeleteConfirmation}
        onConfirm={handleBankDeleteConfirm}
        onCancelAction={() => {
          setPendingDeleteBank(null);
          setShowBankDeleteConfirmation(false);
        }}
        title="Delete Bank"
        itemName={pendingDeleteBank?.bankName ?? "Bank"}
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
