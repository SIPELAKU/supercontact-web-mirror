export function TableSkeleton({
  columns,
  selectable = false,
  actionColumn = false,
  rows = 5,
}: {
  columns: { width?: number }[];
  selectable?: boolean;
  actionColumn?: boolean;
  rows?: number;
}) {
  const applyWidth = (width?: number) =>
    width
      ? { minWidth: `${width}rem`, width: `${width}rem`, maxWidth: `${width}rem` }
      : {};

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#edf1fc] h-16">
              {selectable && (
                <th className="px-6 py-3 w-12 h-16 relative 
                  after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                  after:h-8 after:w-px after:bg-gray-300">
                </th>
              )}

              {columns.map((col, i) => (
                <th
                  key={i}
                  style={applyWidth(col.width)}
                  className="px-6 py-3 relative
                    after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                    after:h-8 after:w-px after:bg-gray-300
                  "
                ></th>
              ))}

              {actionColumn && (
                <th
                  className="px-6 py-3 w-32 h-16 relative
                    after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                    after:h-8 after:w-px after:bg-gray-300"
                ></th>
              )}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="h-16">
                {selectable && (
                  <td className="px-6 py-4 relative
                    after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                    after:h-8 after:w-px after:bg-gray-200"
                  >
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </td>
                )}

                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    style={applyWidth(col.width)}
                    className="px-6 py-4 relative
                      after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                      after:h-8 after:w-px after:bg-gray-200"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                ))}

                {actionColumn && (
                  <td
                    className="px-6 py-4 w-32 relative
                      after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                      after:h-8 after:w-px after:bg-gray-200"
                  >
                    <div className="flex gap-2">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
