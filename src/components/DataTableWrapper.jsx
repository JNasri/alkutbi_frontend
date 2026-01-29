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
import { FileText, FileSpreadsheet, Download } from "lucide-react";

// PrimeReact imports
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const DataTableWrapper = ({ data, columns, title }) => {
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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <span className="relative w-full sm:w-72">
          <i
            className={`pi pi-search absolute top-1/2 transform -translate-y-1/2 text-gray-400 ${
              i18n.language === "ar" ? "left-3" : "right-3"
            }`}
          />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={t("search...")}
            style={{
              backgroundColor: 'var(--surface-b)',
              color: 'var(--text-color)',
              borderColor: 'var(--surface-c)'
            }}
            className={`w-full ${
              i18n.language === "ar" ? "pr-10 pl-3" : "pl-3 pr-10"
            } py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition`}
          />
        </span>
        <div className="flex gap-2">
          <Button
            label={t("Clear")}
            icon="pi pi-filter-slash"
            className="p-button-sm bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition rounded-lg px-3 py-2 border-0"
            onClick={() => {
              setGlobalFilter("");
              setSelectedRows([]);
            }}
          />
          <Button
            label={t("Export Excel")}
            icon="pi pi-file-excel"
            className="p-button-sm bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition rounded-lg px-3 py-2 border-0"
            onClick={exportExcel}
          />
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
                body={col.body}
                style={{
                  minWidth: col.width || (i18n.language === "ar" ? "180px" : "150px"),
                  maxWidth: col.maxWidth || "500px",
                  whiteSpace: col.nowrap ? "nowrap" : "normal",
                }}
                alignHeader="center"
                headerClassName="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold py-3 px-4"
                bodyClassName="text-sm text-gray-800 dark:text-gray-100 text-center py-2 px-4 border-b border-gray-200 dark:border-gray-700"
                frozen={i === columns.length - 1}
                alignFrozen={
                  i === columns.length - 1
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
