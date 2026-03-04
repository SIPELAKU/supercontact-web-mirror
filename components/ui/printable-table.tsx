import React from "react";

interface PrintableTableProps {
    title: string;
    date?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    columns: {
        header: string;
        accessorKey: string;
        cell?: (item: any) => React.ReactNode;
    }[];
}

export const PrintableTable = React.forwardRef<
    HTMLDivElement,
    PrintableTableProps
>(({ title, date = new Date().toLocaleDateString(), data, columns }, ref) => {
    return (
        <div ref={ref} className="p-8 print:p-0">
            <style type="text/css" media="print">
                {`
        @page { size: auto; margin: 20mm; }
        body { -webkit-print-color-adjust: exact; }
      `}
            </style>
            <div className="text-center mb-5">
                <div className="text-2xl font-bold text-[#5479EE]">
                    SmartSales <span className="text-sm font-normal text-gray-500">(Smart Relationship Management)</span>
                </div>
            </div>
            <div className="border-b-2 border-gray-100 my-4"></div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold m-0">{title}</h2>
                <span className="text-gray-500 text-sm">{date}</span>
            </div>
            <table className="w-full border-collapse mb-5">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className="border border-gray-300 p-2 text-left bg-gray-100 font-bold"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr key={rowIndex} className="even:bg-gray-50">
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="border border-gray-300 p-2">
                                    {col.cell
                                        ? col.cell(item)
                                        : item[col.accessorKey] || item[col.accessorKey] === 0
                                            ? item[col.accessorKey]
                                            : "-"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

PrintableTable.displayName = "PrintableTable";
