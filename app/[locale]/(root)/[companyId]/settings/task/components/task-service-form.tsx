"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@progress/kendo-react-buttons";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IApiSuccessResponse } from "@/interfaces/auth";
import type { ITaskService } from "@/interfaces/task-service";
import type { ServiceFieldValues } from "@/schemas/task-service";
import { taskServiceFormSchema } from "@/schemas/task-service";
import { useTaskLookup } from "@/hooks/use-lookup";
import {
  useTaskServiceGet,
  useTaskServiceSave,
} from "@/hooks/use-task-service";
import { ChargeCombobox } from "@/components/ui/combobox/charge-combobox";
import { UomCombobox } from "@/components/ui/combobox/uom-combobox";
import { SaveConfirmation } from "@/components/ui/confirmation";
import { toast } from "@/components/layout/notification-container";
import type { IChargeLookup } from "@/interfaces/lookup";
import type { IUomLookup } from "@/interfaces/lookup";
import type { ITaskLookup } from "@/interfaces/lookup";

type TaskServiceSchemaType = { services: Record<string, ServiceFieldValues> };
type TaskServiceResponse = IApiSuccessResponse<ITaskService[]>;

const toCharge = (id: number | undefined): IChargeLookup | null =>
  (id ?? 0) > 0 ? { chargeId: id ?? 0, chargeName: "", chargeCode: "", glId: 0 } : null;
const toUom = (id: number | undefined): IUomLookup | null =>
  (id ?? 0) > 0 ? { uomId: id ?? 0, uomCode: "", uomName: "" } : null;
const toTask = (id: number | undefined): ITaskLookup | null =>
  (id ?? 0) > 0 ? { taskId: id ?? 0, taskName: "", taskCode: "" } : null;

export function TaskServiceForm() {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const {
    data: taskServiceResponse,
    isLoading,
    isError,
    refetch,
  } = useTaskServiceGet();
  const { data: tasks = [] } = useTaskLookup();
  const { mutate: saveTaskService, isPending } = useTaskServiceSave();

  const taskIds = tasks.map((t) => t.taskId);
  const defaultServices: Record<string, ServiceFieldValues> = {};
  taskIds.forEach((taskId) => {
    defaultServices[String(taskId)] = {
      taskId,
      chargeId: 0,
      forkliftChargeId: 0,
      stevedoreChargeId: 0,
      uomId: 0,
      carrierId: 0,
      serviceModeId: 0,
      consignmentTypeId: 0,
      visaId: 0,
      landingTypeId: 0,
      taskStatusId: 0,
    };
  });

  const form = useForm<TaskServiceSchemaType>({
    resolver: zodResolver(taskServiceFormSchema),
    defaultValues: { services: defaultServices },
  });

  useEffect(() => {
    if (taskServiceResponse) {
      const res = taskServiceResponse as TaskServiceResponse;
      if (res.result === 1 && Array.isArray(res.data)) {
        const services: Record<string, ServiceFieldValues> = {};
        res.data.forEach((ts: ITaskService) => {
          services[String(ts.taskId)] = {
            taskId: ts.taskId,
            chargeId: ts.chargeId ?? 0,
            forkliftChargeId: ts.forkliftChargeId ?? 0,
            stevedoreChargeId: ts.stevedoreChargeId ?? 0,
            uomId: ts.uomId ?? 0,
            carrierId: ts.carrierId ?? 0,
            serviceModeId: ts.serviceModeId ?? 0,
            consignmentTypeId: ts.consignmentTypeId ?? 0,
            visaId: ts.visaId ?? 0,
            landingTypeId: ts.landingTypeId ?? 0,
            taskStatusId: ts.taskStatusId ?? 0,
          };
        });
        form.reset({ services });
      } else if (taskIds.length > 0) {
        form.reset({ services: defaultServices });
      }
    }
  }, [taskServiceResponse, taskIds.length, form]);

  const onSubmit = () => setShowSaveConfirmation(true);

  const handleConfirmSave = () => {
    const formData = form.getValues();
    const services = formData.services ?? {};
    const servicesArray = Object.values(services).filter(
      (s): s is ServiceFieldValues => Boolean(s) && s.taskId > 0
    );
    saveTaskService(
      servicesArray[0] ?? ({ taskId: 0, chargeId: 0, uomId: 0 } as ServiceFieldValues),
      {
        onSuccess: (response) => {
          const r = response as IApiSuccessResponse<{ success: boolean }>;
          if (r.result === -1) {
            toast.error(r.message || "Failed to save task service settings");
            return;
          }
          if (r.result === 1) {
            toast.success(
              r.message || "Task service settings saved successfully"
            );
            refetch();
          }
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to save task service settings"
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border p-8">
        <p className="text-rose-500">Failed to load task service settings</p>
        <Button fillMode="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Task Service Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure charges and UOM per task service
              </p>
            </div>
            <Button
              type="submit"
              themeColor="primary"
              size="medium"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="space-y-6">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                className="rounded-lg border p-4"
              >
                <h4 className="mb-4 text-lg font-medium">
                  {task.taskName} ({task.taskCode})
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Controller
                    name={`services.${task.taskId}.chargeId`}
                    control={form.control}
                    render={({ field }) => (
                      <ChargeCombobox
                        value={toCharge(field.value)}
                        onChange={(v) => field.onChange(v?.chargeId ?? 0)}
                        label="Charge"
                        isRequired
                      />
                    )}
                  />
                  <Controller
                    name={`services.${task.taskId}.uomId`}
                    control={form.control}
                    render={({ field }) => (
                      <UomCombobox
                        value={toUom(field.value)}
                        onChange={(v) => field.onChange(v?.uomId ?? 0)}
                        label="UOM"
                        isRequired
                      />
                    )}
                  />
                  <Controller
                    name={`services.${task.taskId}.forkliftChargeId`}
                    control={form.control}
                    render={({ field }) => (
                      <ChargeCombobox
                        value={toCharge(field.value)}
                        onChange={(v) => field.onChange(v?.chargeId ?? 0)}
                        label="Forklift Charge"
                      />
                    )}
                  />
                  <Controller
                    name={`services.${task.taskId}.stevedoreChargeId`}
                    control={form.control}
                    render={({ field }) => (
                      <ChargeCombobox
                        value={toCharge(field.value)}
                        onChange={(v) => field.onChange(v?.chargeId ?? 0)}
                        label="Stevedore Charge"
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {tasks.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No tasks available. Configure tasks in the system first.
            </p>
          )}
        </form>
      </FormProvider>

      <SaveConfirmation
        title="Save Task Service Settings"
        itemName="task service settings"
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
        onConfirm={handleConfirmSave}
        isSaving={isPending}
        operationType="update"
      />
    </div>
  );
}
