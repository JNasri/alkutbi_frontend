import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { OverlayPanel } from "primereact/overlaypanel";
import { Calendar } from "primereact/calendar";
import LoadingSpinner from "./LoadingSpinner";
import i18n from "../../i18n";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileSpreadsheet, Search, FilterX, ListFilter, CalendarDays } from "lucide-react";

// PrimeReact imports
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Fields that should never have a column filter
const NO_FILTER_FIELDS = new Set([
  "attachment", "attachments", "actions", "edit", "print",
]);

// ── localStorage helpers for filter persistence ─────────────────────────────
const STORAGE_PREFIX = "dtw_filters_";

function loadFilters(title) {
  if (!title) return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + title);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Revive Date strings back into Date objects in columnFilters & dateDraft
    for (const obj of [parsed.columnFilters, parsed.dateDraft]) {
      if (!obj) continue;
      for (const key of Object.keys(obj)) {
        const f = obj[key];
        if (f?.from) f.from = new Date(f.from);
        if (f?.to) f.to = new Date(f.to);
      }
    }
    return parsed;
  } catch { return null; }
}

function saveFilters(title, state) {
  if (!title) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + title, JSON.stringify(state));
  } catch { /* quota exceeded — silently ignore */ }
}

// ── Shared button styles matching the site design ─────────────────────────
const BTN_APPLY =
  "flex-1 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors shadow-sm cursor-pointer";
const BTN_CLEAR =
  "flex-1 py-2 text-sm font-semibold bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors cursor-pointer";

const DataTableWrapper = ({
  data,
  columns,
  title,
  freezeLastColumn = true,
  sumField = null,
  dateField = "createdAt",
  onRefresh,
}) => {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // ── Restore saved filters from localStorage ────────────────────────────────
  const saved = useMemo(() => loadFilters(title), [title]);

  // ── Core table state ──────────────────────────────────────────────────────
  const [globalFilter, setGlobalFilter] = useState(saved?.globalFilter ?? "");
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(saved?.rows ?? 10);
  const [visibleData, setVisibleData] = useState(data);
  const dt = useRef(null);

  // ── Today / All toggle ─────────────────────────────────────────────────────
  const [showToday, setShowToday] = useState(saved?.showToday ?? true);

  // ── Column filter state ───────────────────────────────────────────────────
  const [columnFilters, setColumnFilters] = useState(saved?.columnFilters ?? {});
  const [searchDraft, setSearchDraft] = useState(saved?.searchDraft ?? {});
  const [dateDraft, setDateDraft] = useState(saved?.dateDraft ?? {});
  const filterPanelRefs = useRef({});

  useEffect(() => { setVisibleData(data); }, [data]);

  // ── Persist filters to localStorage on change ─────────────────────────────
  useEffect(() => {
    saveFilters(title, { globalFilter, columnFilters, searchDraft, dateDraft, rows, showToday });
  }, [title, globalFilter, columnFilters, searchDraft, dateDraft, rows, showToday]);

  // Reset pagination when Today/All is toggled
  useEffect(() => { setFirst(0); }, [showToday]);

  const handleTodayToggle = async (isToday) => {
    setLoading(true);
    setShowToday(isToday);
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (err) {
        console.error(err);
      }
    } else {
      await new Promise((res) => setTimeout(res, 400));
    }
    setLoading(false);
  };

  // Close all filter panels when language changes
  useEffect(() => {
    Object.values(filterPanelRefs.current).forEach((panel) => panel?.hide());
  }, [i18n.language]);

  // ── Filter type detection ─────────────────────────────────────────────────
  const filterTypeMap = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      if (NO_FILTER_FIELDS.has(col.field)) { map[col.field] = null; return; }
      if (col.filterType === null)          { map[col.field] = null; return; }
      if (col.filterType)                   { map[col.field] = col.filterType; return; }

      const fl = col.field.toLowerCase();
      if (fl.includes("date") || fl.endsWith("_at") || fl.endsWith("time")) {
        map[col.field] = "date"; return;
      }

      const primitiveVals = data
        .map((row) => row[col.field])
        .filter((v) => v != null && v !== "" && typeof v !== "object" && typeof v !== "function");
      const unique = new Set(primitiveVals.map(String));
      if (unique.size === 0) { map[col.field] = null; return; }
      map[col.field] = unique.size < 10 ? "select" : "search";
    });
    return map;
  }, [columns, data]);

  // ── Select options ────────────────────────────────────────────────────────
  const selectOptionsMap = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      if (filterTypeMap[col.field] !== "select") return;
      if (col.filterOptions) { map[col.field] = col.filterOptions; return; }
      const vals = data
        .map((row) => row[col.field])
        .filter((v) => v != null && v !== "" && typeof v !== "object" && typeof v !== "function");
      map[col.field] = [...new Set(vals.map(String))].sort().map((v) => ({ label: v, value: v }));
    });
    return map;
  }, [columns, data, filterTypeMap]);

  // ── Active filter helpers ─────────────────────────────────────────────────
  const hasActiveFilter = useCallback(
    (field) => {
      const f = columnFilters[field];
      if (!f) return false;
      if (f.type === "search") return !!f.value;
      if (f.type === "select") return f.value?.length > 0;
      if (f.type === "date")   return !!(f.from || f.to);
      return false;
    },
    [columnFilters]
  );

  const activeFilterCount = useMemo(
    () => columns.filter((c) => hasActiveFilter(c.field)).length,
    [columns, hasActiveFilter]
  );

  // ── Today / All pre-filter ─────────────────────────────────────────────────
  const baseData = useMemo(() => {
    if (!showToday || !dateField) return data;
    const todayStr = new Date().toLocaleDateString();
    return data.filter((row) => {
      const val = row[dateField];
      if (val == null || val === "") return false;
      // Compare as locale string (matches createdAt formatted with toLocaleDateString)
      if (val === todayStr) return true;
      // Also try parsing as a Date for YYYY-MM-DD or other formats
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime()) && parsed.toLocaleDateString() === todayStr) return true;
      return false;
    });
  }, [data, showToday, dateField]);

  // ── Column filtering ──────────────────────────────────────────────────────
  const columnFilteredData = useMemo(() => {
    const activeEntries = Object.entries(columnFilters).filter(([, f]) => f);
    if (activeEntries.length === 0) return baseData;

    return baseData.filter((row) =>
      activeEntries.every(([field, filter]) => {
        if (filter.type === "search" && filter.value) {
          return String(row[field] ?? "").toLowerCase().includes(filter.value.toLowerCase());
        }
        if (filter.type === "select" && filter.value?.length > 0) {
          return filter.value.includes(String(row[field] ?? ""));
        }
        if (filter.type === "date" && (filter.from || filter.to)) {
          const d = new Date(row[field]);
          if (isNaN(d.getTime())) return false;
          if (filter.from) {
            const from = new Date(filter.from); from.setHours(0, 0, 0, 0);
            if (d < from) return false;
          }
          if (filter.to) {
            const to = new Date(filter.to); to.setHours(23, 59, 59, 999);
            if (d > to) return false;
          }
          return true;
        }
        return true;
      })
    );
  }, [data, columnFilters]);

  // ── Sum ───────────────────────────────────────────────────────────────────
  const totalSum = useMemo(() => {
    if (!sumField) return 0;
    let source = columnFilteredData;
    if (globalFilter) {
      const lower = globalFilter.toLowerCase();
      source = source.filter((row) =>
        columns.some((col) => {
          const val = row[col.field];
          return val != null && typeof val !== "object" && String(val).toLowerCase().includes(lower);
        })
      );
    }
    return source.reduce((acc, row) => {
      const val = row[sumField];
      const n = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
      return acc + (n || 0);
    }, 0);
  }, [columnFilteredData, globalFilter, sumField, columns]);

  const rowsPerPageOptions = [5, 10, 25, 50];

  // ── Single-panel toggle: close all others before opening ─────────────────
  const toggleFilterPanel = useCallback((e, field) => {
    e.stopPropagation();
    Object.entries(filterPanelRefs.current).forEach(([f, panel]) => {
      if (f !== field) panel?.hide();
    });
    filterPanelRefs.current[field]?.toggle(e);
  }, []);

  // ── Filter actions ────────────────────────────────────────────────────────
  const applySearchFilter = (field) => {
    const val = searchDraft[field] ?? "";
    setColumnFilters((prev) => ({ ...prev, [field]: { type: "search", value: val } }));
    filterPanelRefs.current[field]?.hide();
  };

  const applySelectFilter = (field) => {
    // Values are already applied live; just close the panel
    filterPanelRefs.current[field]?.hide();
  };

  const applyDateFilter = (field) => {
    const draft = dateDraft[field] || {};
    setColumnFilters((prev) => ({
      ...prev,
      [field]: { type: "date", from: draft.from || null, to: draft.to || null },
    }));
    filterPanelRefs.current[field]?.hide();
  };

  const clearColumnFilter = (field) => {
    setColumnFilters((prev) => { const n = { ...prev }; delete n[field]; return n; });
    setSearchDraft((prev)  => { const n = { ...prev }; delete n[field]; return n; });
    setDateDraft((prev)    => { const n = { ...prev }; delete n[field]; return n; });
    filterPanelRefs.current[field]?.hide();
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setSelectedRows([]);
    setColumnFilters({});
    setSearchDraft({});
    setDateDraft({});
  };

  // ── Filter popup content ──────────────────────────────────────────────────
  const renderFilterContent = (col, filterType) => {
    const { field } = col;

    // Shared wrapper — sets dir so RTL works correctly inside portals
    const Wrap = ({ children, width = "w-64" }) => (
      <div
        className={`${width} bg-white dark:bg-gray-800`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            {col.header}
          </p>
          {children}
        </div>
      </div>
    );

    /* ── SEARCH ── */
    if (filterType === "search") {
      return (
        <Wrap>
          <input
            type="text"
            value={searchDraft[field] ?? ""}
            onChange={(e) => setSearchDraft((prev) => ({ ...prev, [field]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") applySearchFilter(field); }}
            placeholder={t("search...")}
            autoFocus
            className="w-full px-3 py-2 mb-3 text-sm bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <div className="flex gap-2 pb-4">
            <button onClick={() => clearColumnFilter(field)} className={BTN_CLEAR}>{t("Clear")}</button>
            <button onClick={() => applySearchFilter(field)} className={BTN_APPLY}>{t("Apply")}</button>
          </div>
        </Wrap>
      );
    }

    /* ── MULTI-SELECT CHECKBOXES ── */
    if (filterType === "select") {
      const options = selectOptionsMap[field] || [];
      const currentVal = columnFilters[field]?.value || [];
      return (
        <Wrap width="w-52">
          <div className="flex flex-col gap-0.5 mb-3 max-h-52 overflow-y-auto -mx-1 px-1">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={currentVal.includes(opt.value)}
                  onChange={(e) => {
                    const newVal = e.target.checked
                      ? [...currentVal, opt.value]
                      : currentVal.filter((v) => v !== opt.value);
                    setColumnFilters((prev) => ({ ...prev, [field]: { type: "select", value: newVal } }));
                  }}
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pb-4">
            <button onClick={() => clearColumnFilter(field)} className={BTN_CLEAR}>{t("Clear")}</button>
            <button onClick={() => applySelectFilter(field)} className={BTN_APPLY}>{t("Apply")}</button>
          </div>
        </Wrap>
      );
    }

    /* ── DATE RANGE ── */
    if (filterType === "date") {
      const draft = dateDraft[field] || {};
      return (
        <Wrap width="w-72">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t("from")}
            </label>
            {/* dir="ltr" keeps input-then-icon order correct in RTL layouts.
                The calendar panel still inherits the document dir for Arabic month names. */}
            <div dir="ltr">
              <Calendar
                value={draft.from || null}
                onChange={(e) =>
                  setDateDraft((prev) => ({ ...prev, [field]: { ...(prev[field] || {}), from: e.value } }))
                }
                dateFormat="yy-mm-dd"
                showIcon
                showButtonBar
                className="w-full"
                inputClassName="w-full text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              {t("to")}
            </label>
            <div dir="ltr">
              <Calendar
                value={draft.to || null}
                onChange={(e) =>
                  setDateDraft((prev) => ({ ...prev, [field]: { ...(prev[field] || {}), to: e.value } }))
                }
                dateFormat="yy-mm-dd"
                showIcon
                showButtonBar
                minDate={draft.from || undefined}
                className="w-full"
                inputClassName="w-full text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 pb-4">
            <button onClick={() => clearColumnFilter(field)} className={BTN_CLEAR}>{t("Clear")}</button>
            <button onClick={() => applyDateFilter(field)}  className={BTN_APPLY}>{t("Apply")}</button>
          </div>
        </Wrap>
      );
    }

    return null;
  };

  // ── Excel export ──────────────────────────────────────────────────────────
  const exportExcel = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        // Start from column-filtered data, then apply global filter manually
        let exportData = columnFilteredData;
        if (globalFilter) {
          const lower = globalFilter.toLowerCase();
          exportData = exportData.filter((row) =>
            columns.some((col) => {
              const val = row[col.field];
              return val != null && String(val).toLowerCase().includes(lower);
            })
          );
        }

        const worksheetData = exportData.map((row) => {
          const obj = {};
          columns.forEach((col) => {
            const value = row[col.field];
            if (typeof value === "object" && value !== null && value.props) {
              obj[col.header] = value.props.children || value.props.title || "";
            } else {
              obj[col.header] = value;
            }
          });
          return obj;
        });
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook  = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title || "Sheet1");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(dataBlob, `${title || "data"}.xlsx`);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const exportCSV = () => dt.current.exportCSV();

  // ── Table header ──────────────────────────────────────────────────────────
  const header = (
    <div className="flex flex-col gap-4 mb-6">
      {/* Row 1: Title + Sum badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>

        {sumField && (
          <div className="bg-blue-50/50 dark:bg-blue-900/20 px-5 py-2 rounded-xl flex items-center gap-3 border-2 border-blue-500 dark:border-blue-400 backdrop-blur-sm">
            <span className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              {t("total_amount_sum")}:
            </span>
            <span className="text-blue-800 dark:text-blue-300 text-xl font-black">
              {totalSum.toLocaleString()} {t("sar")}
            </span>
          </div>
        )}
      </div>

      {/* Row 2: Today/All toggle | Search | Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Today / All toggle */}
        {dateField && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => handleTodayToggle(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                showToday
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <CalendarDays size={15} />
              {t("today")}
            </button>
            <button
              onClick={() => handleTodayToggle(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                !showToday
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {t("all")}
            </button>
          </div>
        )}

        {/* Global Search */}
        <div className="relative flex-1 min-w-0 w-full sm:w-auto group">
          <Search
            size={18}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none ${
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
            } py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 transition-all hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:shadow-md font-semibold text-sm cursor-pointer whitespace-nowrap group"
          >
            <FilterX size={16} className="group-hover:-rotate-6 transition-transform" />
            {t("Clear")}
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-orange-500 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={exportExcel}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 transition-all hover:bg-green-100 dark:hover:bg-green-900/40 hover:shadow-md font-semibold text-sm cursor-pointer whitespace-nowrap group"
          >
            <FileSpreadsheet size={16} className="group-hover:scale-110 transition-transform" />
            {t("Export Excel")}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <LoadingSpinner />}

      {/* OverlayPanels at root level — avoids z-index / table overflow issues */}
      {columns.map((col) => {
        const filterType = filterTypeMap[col.field];
        if (!filterType) return null;
        return (
          <OverlayPanel
            key={`fp-${col.field}`}
            ref={(el) => { filterPanelRefs.current[col.field] = el; }}
            dismissable
            className="col-filter-panel"
          >
            {renderFilterContent(col, filterType)}
          </OverlayPanel>
        );
      })}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-all duration-300">
        {header}
        <hr className="my-4 border-gray-300 dark:border-gray-700" />

        <div className="custom-datatable-wrapper rounded-lg overflow-hidden">
          <DataTable
            ref={dt}
            value={columnFilteredData}
            dataKey="id"
            paginator
            rows={rows}
            first={first}
            onPage={(e) => { setFirst(e.first); setRows(e.rows); }}
            rowsPerPageOptions={rowsPerPageOptions}
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate={`${t("showing")} {first}–{last} ${t("of")} {totalRecords} ${t("records")}`}
            globalFilter={globalFilter}
            onValueChange={(e) => setVisibleData(e)}
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
            {columns.map((col, i) => {
              const filterType = filterTypeMap[col.field];
              const isActive   = hasActiveFilter(col.field);

              return (
                <Column
                  key={i}
                  field={col.field}
                  header={
                    <div className="flex items-center gap-1 w-full">
                      {/* Column label */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center cursor-default select-none"
                      >
                        {col.header}
                      </div>

                      {/* Filter icon — same size/style as sort icon via CSS */}
                      {filterType && (
                        <button
                          onClick={(e) => toggleFilterPanel(e, col.field)}
                          title={t("Filter")}
                          className={`col-filter-btn${isActive ? " is-active" : ""}`}
                        >
                          <ListFilter size={13} strokeWidth={2} />
                          {isActive && <span className="col-filter-dot" />}
                        </button>
                      )}
                    </div>
                  }
                  sortable={col.sortable !== false}
                  body={(rowData) => {
                    if (col.body) return col.body(rowData);
                    const value = rowData[col.field];
                    if (["edit", "actions", "print", "attachment"].includes(col.field)) {
                      return <div className="flex justify-center">{value}</div>;
                    }
                    return value;
                  }}
                  style={{
                    minWidth: col.field === "actions" ? "120px" : col.autoWidth ? "auto" : col.width || (i18n.language === "ar" ? "180px" : "150px"),
                    maxWidth: col.maxWidth || "500px",
                    whiteSpace: col.nowrap ? "nowrap" : "normal",
                    width: col.field === "actions" ? "120px" : col.autoWidth ? "1%" : "auto",
                  }}
                  alignHeader="center"
                  headerClassName="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold py-3 px-4"
                  bodyClassName="text-sm text-gray-800 dark:text-gray-100 text-center py-2 px-4 border-b border-gray-200 dark:border-gray-700"
                  frozen={freezeLastColumn && i === columns.length - 1}
                  alignFrozen={
                    freezeLastColumn && i === columns.length - 1
                      ? isRTL ? "left" : "right"
                      : undefined
                  }
                />
              );
            })}
          </DataTable>
        </div>
      </div>
    </>
  );
};

export default DataTableWrapper;

export function clearAllSavedFilters() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
