import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import LoadingSpinner from "./LoadingSpinner";
import i18n from "../../i18n";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileText, FileSpreadsheet, Download, Pencil, Search, FilterX } from "lucide-react";

// PrimeReact imports
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const DataTableWrapper = ({ data, columns, title, freezeLastColumn = true }) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dt = useRef(null);

  // Row options for pagination
  const rowsPerPageOptions = [5, 10, 25, 50];

  // Excel export
  const exportExcel = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const worksheetData = data.map((row) => {
          const obj = {};
          columns.forEach((col) => {
            // Handle JSX elements by extracting text content
            const value = row[col.field];
            if (typeof value === 'object' && value !== null && value.props) {
              // It's a React element, try to extract text
              obj[col.header] = value.props.children || value.props.title || '';
            } else {
              obj[col.header] = value;
            }
          });
          return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title || "Sheet1");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const dataBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });

        saveAs(dataBlob, `${title || "data"}.xlsx`);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // CSV export
  const exportCSV = () => {
    dt.current.exportCSV();
  };

  // Header template with search and export buttons
  const header = (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h2>

      <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
        {/* Modern Search Field */}
        <div className="relative w-full lg:w-80 group">
          <Search
            size={18}
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none ${
              i18n.language === "ar" ? "left-4" : "right-4"
            }`}
          />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={t("search...")}
            className={`w-full ${
              i18n.language === "ar" ? "pr-5 pl-12" : "pl-5 pr-12"
            } py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          <button
            onClick={() => {
              setGlobalFilter("");
              setSelectedRows([]);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 transition-all hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:shadow-md font-semibold text-sm cursor-pointer whitespace-nowrap group"
          >
            <FilterX size={18} className="group-hover:-rotate-6 transition-transform" />
            {t("Clear")}
          </button>

          <button
            onClick={exportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 transition-all hover:bg-green-100 dark:hover:bg-green-900/40 hover:shadow-md font-semibold text-sm cursor-pointer whitespace-nowrap group"
          >
            <FileSpreadsheet size={18} className="group-hover:scale-110 transition-transform" />
            {t("Export Excel")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-all duration-300">
        {header}

        <hr className="my-4 border-gray-300 dark:border-gray-700" />

        {/* DataTable */}
        <div className="custom-datatable-wrapper rounded-lg overflow-hidden">
          <DataTable
            ref={dt}
            value={data}
            dataKey="id"
            paginator
            rows={rows}
            first={first}
            onPage={(e) => {
              setFirst(e.first);
              setRows(e.rows);
            }}
            rowsPerPageOptions={rowsPerPageOptions}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            globalFilter={globalFilter}
            emptyMessage={t("No records found")}
            stripedRows
            showGridlines
            sortMode="multiple"
            removableSort
            resizableColumns
            columnResizeMode="expand"
            reorderableColumns
            scrollable
            scrollHeight="flex"
            className="custom-table p-datatable-sm"
          >

            {columns.map((col, i) => (
              <Column
                key={i}
                field={col.field}
                header={col.header}
                sortable={col.sortable !== false}
                body={(rowData) => {
                  if (col.body) return col.body(rowData);
                  const value = rowData[col.field];
                  
                  if (col.field === "edit" || col.field === "actions" || col.field === "print" || col.field === "attachment") {
                    return (
                      <div className="flex justify-center">
                         {value}
                      </div>
                    );
                  }
                  return value;
                }}
                style={{
                  minWidth: col.field === "actions" ? "120px" : (col.autoWidth ? "auto" : (col.width || (i18n.language === "ar" ? "180px" : "150px"))),
                  maxWidth: col.maxWidth || "500px",
                  whiteSpace: col.nowrap ? "nowrap" : "normal",
                  width: col.field === "actions" ? "120px" : (col.autoWidth ? "1%" : "auto"),
                }}
                alignHeader="center"
                headerClassName="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold py-3 px-4"
                bodyClassName="text-sm text-gray-800 dark:text-gray-100 text-center py-2 px-4 border-b border-gray-200 dark:border-gray-700"
                frozen={freezeLastColumn && i === columns.length - 1}
                alignFrozen={
                  freezeLastColumn && i === columns.length - 1
                    ? isRTL
                      ? "left"
                      : "right"
                    : undefined
                }
              />
            ))}
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default DataTableWrapper;
