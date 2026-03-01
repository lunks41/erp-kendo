"use client";

import { useParams } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import type { ArInvoiceHdSchemaType } from "@/schemas/ar-invoice";
import type { IVisibleFields } from "@/interfaces/setting";
import { FormInput, FormTextArea } from "@/components/ui/form";
import { CountryCombobox } from "@/components/ui/combobox/country-combobox";
import { Controller } from "react-hook-form";

interface OtherProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>;
  visible?: IVisibleFields;
}

export default function Other({ form, visible }: OtherProps) {
  const params = useParams();
  const companyId = params.companyId as string;
  const customerId = form.watch("customerId") ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded border p-4">
        <h3 className="mb-3 font-medium">Address</h3>
        {customerId > 0 && (
          <div className="space-y-3">
            <FormInput
              control={form.control}
              name="billName"
              label="Bill Name"
            />
            <FormTextArea
              control={form.control}
              name="address1"
              label="Address Line 1"
            />
            <FormTextArea
              control={form.control}
              name="address2"
              label="Address Line 2"
            />
            <FormTextArea
              control={form.control}
              name="address3"
              label="Address Line 3"
            />
            <FormTextArea
              control={form.control}
              name="address4"
              label="Address Line 4"
            />
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="countryId"
                control={form.control}
                render={({ field }) => (
                  <CountryCombobox
                    value={
                      (field.value as number) > 0
                        ? ({ countryId: field.value, countryName: "" } as import("@/interfaces/lookup").ICountryLookup)
                        : null
                    }
                    onChange={(v) => field.onChange(v?.countryId ?? 0)}
                    label="Country"
                  />
                )}
              />
              <FormInput
                control={form.control}
                name="pinCode"
                label="Pin Code"
              />
              <FormInput
                control={form.control}
                name="phoneNo"
                label="Phone No"
              />
              <FormInput
                control={form.control}
                name="faxNo"
                label="Fax No"
              />
            </div>
          </div>
        )}
        {customerId === 0 && (
          <p className="text-muted-foreground text-sm">
            Select a customer to display address fields.
          </p>
        )}
      </div>

      <div className="rounded border p-4">
        <h3 className="mb-3 font-medium">Contact</h3>
        {customerId > 0 && (
          <div className="space-y-3">
            <FormInput
              control={form.control}
              name="contactName"
              label="Contact Name"
            />
            <FormInput
              control={form.control}
              name="emailAdd"
              label="Email"
            />
            <FormInput
              control={form.control}
              name="mobileNo"
              label="Mobile No"
            />
          </div>
        )}
        {customerId === 0 && (
          <p className="text-muted-foreground text-sm">
            Select a customer to display contact fields.
          </p>
        )}
      </div>

      {(visible?.m_OtherRemarks || visible?.m_AdvRecAmt) && (
        <div className="col-span-2 rounded border p-4">
          <h3 className="mb-3 font-medium">Other</h3>
          <div className="grid grid-cols-2 gap-4">
            {visible?.m_OtherRemarks && (
              <FormTextArea
                control={form.control}
                name="otherRemarks"
                label="Other Remarks"
              />
            )}
            {visible?.m_AdvRecAmt && (
              <Controller
                name="advRecAmt"
                control={form.control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Advance Received Amount
                    </label>
                    <input
                      type="number"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>
                )}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
