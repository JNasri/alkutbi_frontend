import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const buildOrdersSummaryUrl = (arg = {}) => {
  const params = new URLSearchParams();

  if (arg.scope) params.set("scope", arg.scope);
  if (arg.dateBasis) params.set("dateBasis", arg.dateBasis);
  if (arg.from) params.set("from", arg.from);
  if (arg.to) params.set("to", arg.to);

  const queryString = params.toString();
  return `/dashboard/orders-summary${queryString ? `?${queryString}` : ""}`;
};

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      validateStatus: (response, result) => response.status === 200 && !result.isError,
      providesTags: [{ type: "Dashboard", id: "SUMMARY" }],
    }),
    getOrdersSummary: builder.query({
      query: buildOrdersSummaryUrl,
      validateStatus: (response, result) => response.status === 200 && !result.isError,
      providesTags: [{ type: "Dashboard", id: "ORDERS_SUMMARY" }],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetOrdersSummaryQuery,
} = dashboardApiSlice;

// Select the query result object
export const selectDashboardSummaryResult = dashboardApiSlice.endpoints.getDashboardSummary.select();

// Memoized selector
export const selectDashboardSummaryData = createSelector(
  selectDashboardSummaryResult,
  (summaryResult) => summaryResult.data
);
