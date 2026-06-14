import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const banksAdapter = createEntityAdapter({});
const initialState = banksAdapter.getInitialState();

const buildBanksSummaryUrl = (arg = {}) => {
  const params = new URLSearchParams();

  params.set("dateBasis", "dateAD");
  if (arg.from) params.set("from", arg.from);
  if (arg.to) params.set("to", arg.to);

  const queryString = params.toString();
  return `/banks/summary${queryString ? `?${queryString}` : ""}`;
};

export const banksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBanks: builder.query({
      query: () => "/banks",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => {
        const dataArray = Array.isArray(responseData) ? responseData : [];
        const loadedBanks = dataArray.map((bank) => {
          bank.id = bank._id;
          return bank;
        });
        return banksAdapter.setAll(initialState, loadedBanks);
      },
      providesTags: (result) => {
        if (result?.ids) {
          return [
            { type: "Bank", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Bank", id })),
          ];
        }
        return [{ type: "Bank", id: "LIST" }];
      },
    }),
    getBanksSummary: builder.query({
      query: buildBanksSummaryUrl,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => responseData?.banks || [],
      providesTags: [{ type: "Bank", id: "SUMMARY" }],
    }),
    addNewBank: builder.mutation({
      query: (initialData) => ({
        url: "/banks",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [
        { type: "Bank", id: "LIST" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),
    updateBank: builder.mutation({
      query: (data) => ({
        url: "/banks",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Bank", id: arg.id },
        { type: "Bank", id: "LIST" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),
    deleteBank: builder.mutation({
      query: ({ id }) => ({
        url: "/banks",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Bank", id: arg.id },
        { type: "Bank", id: "LIST" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetBanksQuery,
  useGetBanksSummaryQuery,
  useAddNewBankMutation,
  useUpdateBankMutation,
  useDeleteBankMutation,
} = banksApiSlice;

export const selectBanksResult = banksApiSlice.endpoints.getBanks.select();

const selectBanksData = createSelector(
  selectBanksResult,
  (banksResult) => banksResult.data
);

export const {
  selectAll: selectAllBanks,
  selectById: selectBankById,
  selectIds: selectBankIds,
} = banksAdapter.getSelectors(
  (state) => selectBanksData(state) ?? initialState
);
