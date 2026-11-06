"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { startImportJob } from "@/lib/api/import-jobs";
import { importFileReadArgs, mapFileRows, type ColumnMapping } from "@/lib/utils/importFileRead";
import {
  applyFileResolutions,
  checkImportFile,
  fileCheckSummary,
  type FileRow,
  type GroupResolution,
} from "@/lib/utils/importFileDuplicates";
import { describeUploadError, ImportPartsError, uploadImportParts } from "@/lib/utils/importJobUpload";
import {
  IMPORT_VIEWS,
  importFieldOptions,
  importJobBody,
  missingMappings,
  type ImportFieldOption,
  type ImportView,
} from "@/lib/utils/importModules";
import { suggestContactField } from "@/lib/utils/importRules";
import { useImportWatch } from "@/lib/store/importWatch";
import { FileDuplicateDialog } from "./FileDuplicateDialog";
import { ImportCheckStep } from "./ImportCheckStep";
import { ImportMappingStep } from "./ImportMappingStep";
import { ImportPreviewStep } from "./ImportPreviewStep";
import { ImportUploadStep } from "./ImportUploadStep";

interface ImportFileModalProps {
  view: ImportView;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // The mailing list or group the rows go into (views `mailing_list`, `broadcast_group`).
  groupIds?: string[];
}

type ImportStep = "upload" | "mapping" | "check" | "preview";

const STEP_ORDER: { key: ImportStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "Map Columns" },
  { key: "check", label: "Check" },
  { key: "preview", label: "Preview" },
];

const stepDescription = (step: ImportStep, noun: string) =>
  ({
    upload: `Upload an Excel or CSV file to import ${noun}s in bulk.`,
    mapping: `Map your file columns to ${noun} fields.`,
    check: "Settle duplicate rows and see which rows will be skipped.",
    preview: "Review the data before importing.",
  })[step];

const plural = (count: number, word: string) => `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

// One import wizard for every module (T2): Upload, Map Columns, Check, Preview.
// What differs between modules comes from IMPORT_VIEWS.
export const ImportFileModal = ({ view, open, onClose, onSuccess, groupIds }: ImportFileModalProps) => {
  const config = IMPORT_VIEWS[view];
  const initialFields = useMemo(() => importFieldOptions(config.rules), [config.rules]);
  const { getToken } = useAuth();
  const watchImport = useImportWatch((state) => state.watch);

  const [isLoading, setIsLoading] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [fields, setFields] = useState<ImportFieldOption[]>(initialFields);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  // The file's rows as fields, trimmed (built when leaving Mapping).
  const [mappedRows, setMappedRows] = useState<FileRow[]>([]);

  // FE-6: the file check, the choices for its duplicate groups (keyed by the
  // group's position) and the group whose dialog is open.
  const check = useMemo(() => checkImportFile(mappedRows, config.fileRules), [mappedRows, config.fileRules]);
  const [resolutions, setResolutions] = useState<Record<number, GroupResolution>>({});
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const summary = fileCheckSummary(check, resolutions);
  // What Import sends; null while a group still needs a choice.
  const rowsToSend = useMemo(
    () => (summary.needChoice > 0 ? null : applyFileResolutions(mappedRows, check, resolutions)),
    [summary.needChoice, mappedRows, check, resolutions],
  );

  const mappedFields = columnMappings.map((mapping) => mapping.apiField);
  const mappingProblems = missingMappings(config, mappedFields);

  const handleClose = () => {
    setFile(null);
    setStep("upload");
    setColumnMappings([]);
    setFields(initialFields);
    setRawData([]);
    setMappedRows([]);
    setResolutions({});
    setOpenGroup(null);
    onClose();
  };

  const parseFile = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      // xlsx is loaded on demand: this modal only needs it once the user
      // actually picks a file, and a static import put ~400 kB of SheetJS
      // into the first load of every page that can open this modal.
      const XLSX = await import("xlsx");
      // A CSV is read as UTF-8 text with every cell kept as text, so
      // "0812…" keeps its 0 and "tökö" stays readable (importFileRead.ts).
      const { data: input, options } = importFileReadArgs(file.name, data);
      const workbook = XLSX.read(input, options);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) throw new Error("File is empty");

      setRawData(rows);
      setColumnMappings(
        Object.keys(rows[0]).map((column) => ({ excelColumn: column, apiField: suggestContactField(column) })),
      );
      setStep("mapping");
    } catch (error: any) {
      notify.error("Error reading file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Leaving Mapping: the file check runs on the new rows (useMemo above), and
  // earlier choices belong to the old rows, so they are cleared.
  const buildRows = () => {
    setMappedRows(mapFileRows(rawData, columnMappings));
    setResolutions({});
    setStep("check");
  };

  const followImport = (jobIds: string[]) =>
    watchImport({ module: config.module, view, groupIds, fileName: file?.name || `${config.label}s import`, jobIds });

  const uploadRows = async () => {
    if (!rowsToSend || rowsToSend.length === 0) return;

    // Locks the Import button (disabled while isLoading) until every part is
    // sent, so the file cannot go out twice (FE-3).
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");

      // Every part of up to IMPORT_CHUNK_SIZE rows (2,000, FE-9) is a job of
      // its own. Rows are created by the jobs, not by these requests.
      // Duplicates inside the file are settled before the split, so the parts
      // never repeat one another (BE Q-6).
      const jobBody = importJobBody(config, groupIds);
      const { jobIds } = await uploadImportParts({
        rows: rowsToSend,
        rowsKey: config.rowsKey,
        fileName: file?.name,
        send: (body) => startImportJob(token, config.module, { ...jobBody, ...body }),
      });
      // The import dock follows the file (FE-1).
      followImport(jobIds);

      notify.success(`${config.label} import started`, {
        description:
          `${plural(rowsToSend.length, "row")} ${rowsToSend.length === 1 ? "is" : "are"} being imported in the background` +
          (jobIds.length > 1 ? ` in ${jobIds.length} parts` : "") +
          ". Track the progress in Import History.",
      });
      // Not a warning: skipping these rows is the rule, it is only recorded.
      if (summary.skipped > 0) {
        notify.info(`${plural(summary.skipped, "row")} without email or phone ${summary.skipped === 1 ? "was" : "were"} skipped`);
      }
      if (summary.invalid > 0) {
        notify.warning(`${plural(summary.invalid, "invalid row")} ${summary.invalid === 1 ? "was" : "were"} not imported`);
      }
      handleClose();
      onSuccess();
    } catch (error: any) {
      notify.error(`Failed to upload ${config.noun}s to server.`, {
        description: describeUploadError(error),
        duration: 10000,
      });
      // Earlier parts were imported: follow them and show them. The wizard
      // starts over, or reopening it would offer to send the same rows again.
      if (error instanceof ImportPartsError && error.part > 1) {
        followImport(error.jobIds);
        handleClose();
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const backButton = (to: ImportStep) => (
    <AppButton onClick={() => setStep(to)} variantStyle="outline" color="primary" disabled={isLoading}>
      <div className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </div>
    </AppButton>
  );

  const nextLabel = (label: string) => (
    <div className="flex items-center gap-2">
      {label} <ArrowRight className="w-4 h-4" />
    </div>
  );

  const busyLabel = (label: string) => (
    <div className="flex items-center gap-2">
      <Loader2 className="animate-spin w-5 h-5" />
      {label}
    </div>
  );

  const footer = (left: React.ReactNode, next: React.ReactNode) => (
    <div className="flex w-full justify-between gap-3 font-medium">
      <div>{left}</div>
      <div className="flex gap-3">
        <AppButton onClick={handleClose} variantStyle="outline" color="primary" disabled={isLoading}>
          Cancel
        </AppButton>
        {next}
      </div>
    </div>
  );

  const actions: Record<ImportStep, React.ReactNode> = {
    upload: footer(
      null,
      <AppButton onClick={parseFile} disabled={isLoading || !file} variantStyle="primary" color="primary">
        {isLoading ? busyLabel("Reading...") : nextLabel("Next")}
      </AppButton>,
    ),
    mapping: footer(
      backButton("upload"),
      <AppButton onClick={buildRows} disabled={mappingProblems.length > 0} variantStyle="primary" color="primary">
        {nextLabel("Check")}
      </AppButton>,
    ),
    check: footer(
      backButton("mapping"),
      <AppButton
        onClick={() => setStep("preview")}
        disabled={!rowsToSend || rowsToSend.length === 0}
        variantStyle="primary"
        color="primary"
      >
        {nextLabel("Preview")}
      </AppButton>,
    ),
    preview: footer(
      backButton("check"),
      <AppButton
        onClick={uploadRows}
        disabled={isLoading || !rowsToSend || rowsToSend.length === 0}
        variantStyle="primary"
        color="primary"
      >
        {isLoading ? busyLabel("Importing...") : `Import ${plural(rowsToSend?.length ?? 0, config.label)}`}
      </AppButton>,
    ),
  };

  return (
    <>
      <AppDialog
        open={open}
        onClose={() => !isLoading && setShowCloseConfirmation(true)}
        title={config.title}
        description={stepDescription(step, config.noun)}
        maxWidth="md"
        actions={actions[step]}
      >
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {STEP_ORDER.map((s, index) => (
              <React.Fragment key={s.key}>
                {index > 0 && <div className="w-6 h-px bg-gray-300" />}
                <div className={`flex items-center gap-1 text-sm ${step === s.key ? "text-[#5479EE] font-medium" : "text-gray-400"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === s.key ? "bg-[#5479EE] text-white" : "bg-gray-200"}`}>
                    {index + 1}
                  </span>
                  {s.label}
                </div>
              </React.Fragment>
            ))}
          </div>

          {step === "upload" && <ImportUploadStep file={file} onFile={setFile} template={config.template} />}

          {step === "mapping" && (
            <ImportMappingStep
              mappings={columnMappings}
              onMappingsChange={setColumnMappings}
              fields={fields}
              onFieldsChange={setFields}
              firstRow={rawData[0]}
              problems={mappingProblems}
            />
          )}

          {step === "check" && (
            <>
              <ImportCheckStep check={check} resolutions={resolutions} onOpenGroup={setOpenGroup} />
              {summary.needChoice > 0 && (
                <p className="text-sm text-amber-700 mt-3">Resolve every duplicate group that needs a choice to continue.</p>
              )}
            </>
          )}

          {step === "preview" && rowsToSend && <ImportPreviewStep rows={rowsToSend} mappedFields={mappedFields} />}
        </div>
      </AppDialog>

      <FileDuplicateDialog
        rows={mappedRows}
        group={openGroup === null ? null : check.groups[openGroup] ?? null}
        resolution={openGroup === null ? undefined : resolutions[openGroup]}
        onResolve={(resolution) => {
          if (openGroup !== null) setResolutions((prev) => ({ ...prev, [openGroup]: resolution }));
          setOpenGroup(null);
        }}
        onClose={() => setOpenGroup(null)}
      />

      <ConfirmationPopup
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={() => {
          setShowCloseConfirmation(false);
          handleClose();
        }}
        title="Are you sure?"
        description="This will cancel your import process."
        confirmText="Discard"
        cancelText="Cancel"
        variant="discard"
      />
    </>
  );
};
