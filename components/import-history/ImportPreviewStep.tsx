"use client";

import type { FileRow } from "@/lib/utils/importFileDuplicates";

interface ImportPreviewStepProps {
  // Exactly the rows Import sends.
  rows: FileRow[];
  mappedFields: (string | null)[];
}

const ROWS_SHOWN = 50;

// Last step of the import wizard: the first rows as they will be sent.
export const ImportPreviewStep = ({ rows, mappedFields }: ImportPreviewStepProps) => {
  const columns = Array.from(new Set(mappedFields.filter((field): field is string => Boolean(field))));

  return (
    <>
      <div className="max-h-[50vh] overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700">#</th>
              {columns.map((field) => (
                <th key={field} className="text-left p-3 font-medium text-gray-700 capitalize">
                  {field.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, ROWS_SHOWN).map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-3 text-gray-500">{idx + 1}</td>
                {columns.map((field) => (
                  <td key={field} className="p-3 text-gray-900 truncate max-w-[120px]">
                    {row[field] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-sm text-gray-500">
        Showing {Math.min(ROWS_SHOWN, rows.length).toLocaleString()} of {rows.length.toLocaleString()}{" "}
        {rows.length === 1 ? "row" : "rows"} to import.
      </div>
    </>
  );
};
