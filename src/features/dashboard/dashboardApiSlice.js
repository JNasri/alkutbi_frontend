import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "/dashboard/summary",
      validateStatus: (response, result) => response.status === 200 && !result.isError,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApiSlice;

// Select the query result object
export const selectDashboardSummaryResult = dashboardApiSlice.endpoints.getDashboardSummary.select();

// Memoized selector
export const selectDashboardSummaryData = createSelector(
  selectDashboardSummaryResult,
  (summaryResult) => summaryResult.data
);
