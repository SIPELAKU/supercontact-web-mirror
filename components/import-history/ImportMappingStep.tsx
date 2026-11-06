"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { notify } from "@/lib/notifications";
import type { ColumnMapping } from "@/lib/utils/importFileRead";
import type { ImportFieldOption } from "@/lib/utils/importModules";

interface ImportMappingStepProps {
  mappings: ColumnMapping[];
  onMappingsChange: (mappings: ColumnMapping[]) => void;
  fields: ImportFieldOption[];
  onFieldsChange: (fields: ImportFieldOption[]) => void;
  // The file's first row, shown as sample data.
  firstRow?: Record<string, unknown>;
  // What still has to be mapped before the file can go on.
  problems: string[];
}

// Second step of the import wizard: which field each file column fills.
export const ImportMappingStep = ({
  mappings,
  onMappingsChange,
  fields,
  onFieldsChange,
  firstRow,
  problems,
}: ImportMappingStepProps) => {
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const customFields = fields.filter((field) => field.isCustom);

  const mapColumn = (excelColumn: string, apiField: string | null) =>
    onMappingsChange(mappings.map((m) => (m.excelColumn === excelColumn ? { ...m, apiField } : m)));

  const addCustomField = () => {
    const label = newFieldName.trim();
    if (!label) return;

    const value = label.toLowerCase().replace(/\s+/g, "_");
    if (fields.some((field) => field.value === value)) {
      notify.error("This field already exists");
      return;
    }

    onFieldsChange([...fields, { value, label, isCustom: true }]);
    setNewFieldName("");
    setShowAddField(false);
  };

  const removeCustomField = (value: string | null) => {
    onFieldsChange(fields.filter((field) => field.value !== value));
    onMappingsChange(mappings.map((m) => (m.apiField === value ? { ...m, apiField: null } : m)));
  };

  return (
    <>
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Available Fields</span>
          <button
            onClick={() => setShowAddField(true)}
            className="text-sm text-[#5479EE] hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Custom Field
          </button>
        </div>

        {showAddField && (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Enter field name (e.g., Department, Notes)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5479EE] focus:border-[#5479EE] outline-none"
              onKeyDown={(e) => e.key === "Enter" && addCustomField()}
            />
            <button onClick={addCustomField} className="px-3 py-2 bg-[#5479EE] text-white rounded-lg text-sm hover:bg-[#4368d9]">
              Add
            </button>
            <button
              onClick={() => {
                setShowAddField(false);
                setNewFieldName("");
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {customFields.map((field) => (
            <span key={field.value} className="inline-flex items-center gap-1 px-2 py-1 bg-[#5479EE]/10 text-[#5479EE] rounded text-xs">
              {field.label}
              <button onClick={() => removeCustomField(field.value)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {customFields.length === 0 && <span className="text-xs text-gray-400">No custom fields added yet</span>}
        </div>
      </div>

      <div className="max-h-[40vh] overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">Your Column</th>
              <th className="text-left p-3 font-medium text-gray-700">Maps To</th>
              <th className="text-left p-3 font-medium text-gray-700">Sample Data</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, idx) => (
              <tr key={mapping.excelColumn} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-3 font-medium text-gray-900">{mapping.excelColumn}</td>
                <td className="p-3">
                  <select
                    value={mapping.apiField || ""}
                    onChange={(e) => mapColumn(mapping.excelColumn, e.target.value || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5479EE] focus:border-[#5479EE] outline-none"
                  >
                    {fields.map((field) => (
                      <option key={field.label} value={field.value || ""}>
                        {field.label}
                        {field.isCustom ? " (custom)" : ""}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-gray-500 truncate max-w-[150px]">{String(firstRow?.[mapping.excelColumn] || "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-3">
        Tip: You can map multiple columns to &quot;Name&quot; to combine them. Add custom fields for additional data.
      </p>

      {problems.map((problem) => (
        <p key={problem} className="text-sm text-red-500 mt-2">
          {problem}
        </p>
      ))}
    </>
  );
};
