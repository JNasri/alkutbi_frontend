import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const banksAdapter = createEntityAdapter({});
const initialState = banksAdapter.getInitialState();

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
    addNewBank: builder.mutation({
      query: (initialData) => ({
        url: "/banks",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "Bank", id: "LIST" }],
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
      ],
    }),
  }),
});

export const {
  useGetBanksQuery,
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
