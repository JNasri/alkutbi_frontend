import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import LoadingSpinner from "./LoadingSpinner"; // Assuming you have a LoadingSpinner component
import i18n from "../../i18n";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileText } from "lucide-react"; // Lucide document icon

// index.js or App.js imports
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const DataTableWrapper = ({ data, columns, title }) => {
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState("");

  const [loading, setLoading] = useState(false);

  // Excel export
  const exportExcel = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const worksheetData = data.map((row) => {
          const obj = {};
          columns.forEach((col) => {
            obj[col.header] = row[col.field];
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
    }, 100); // slight delay so spinner renders before blocking operation
  };

  const dt = useRef(null);

  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
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
                className="px-2 py-2 w-full rounded-lg text-sm dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 dark:focus:ring-white transition"
              />
            </span>
            <Button
              label={t("Clear")}
              className="p-button-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition rounded-lg p-2 focus:ring-gray-700 dark:focus:ring-white"
              onClick={() => setGlobalFilter("")}
            />
            <Button
              className="p-button-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition rounded-lg p-2 focus:ring-gray-700 dark:focus:ring-white flex items-center gap-2"
              onClick={exportExcel}
            >
              <FileText className="w-4 h-4" />
              <span>{t("Export Excel")}</span>
            </Button>
          </div>
        </div>

        <hr className="my-4 border-gray-200 dark:border-gray-700" />

        {/* DataTable */}
        <div className="custom-datatable-wrapper rounded-lg overflow-hidden">
          <DataTable
            ref={dt}
            value={data}
            paginator
            rows={10}
            tableStyle={{ tableLayout: "fixed" }} // 👈 Ensure table layout is fixed
            scrollable
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            stripedRows
            showGridlines
            sortMode="multiple"
            removableSort
            globalFilter={globalFilter}
            emptyMessage={t("No records found")}
            className="custom-table p-datatable-sm"
            pt={{
              paginator: {
                root: "p-1 text-sm flex items-center bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white shadow-sm",
                start: "flex items-center space-x-2",
                end: "flex items-center space-x-2",
                pageLinks: "flex space-x-1",
                dropdown:
                  "border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-300",
                rowsPerPageButton:
                  "border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:focus:ring-gray-300",
                currentPageReport: "text-gray-700 dark:text-gray-300 text-sm",
                navButton:
                  "p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition",
                navButtonDisabled: "opacity-50 cursor-not-allowed",
              },
            }}
          >
            {columns.map((col, i) => (
              <Column
                key={i}
                field={col.field}
                header={col.header}
                sortable={col.sortable ?? true}
                style={{
                  width: "150px",
                  padding: "0.5rem",
                  borderBottom: "1px solid",
                  // textAlign: "center"
                }}
                alignHeader="center"
                headerClassName="text-center bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white text-sm font-bold"
                bodyClassName="text-sm dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-center"
                frozen={i === columns.length - 1}
              />
            ))}
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default DataTableWrapper;
