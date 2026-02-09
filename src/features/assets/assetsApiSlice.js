import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const assetsAdapter = createEntityAdapter({});
const initialState = assetsAdapter.getInitialState();

export const assetsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: () => "/assets",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => {
        // Handle array or object with assets property
        const dataArray = Array.isArray(responseData)
          ? responseData
          : responseData.assets || [];

        const loadedAssets = dataArray.map((asset) => {
          asset.id = asset._id; // required for entity adapter
          return asset;
        });

        return assetsAdapter.setAll(initialState, loadedAssets);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Asset", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Asset", id })),
          ];
        } else return [{ type: "Asset", id: "LIST" }];
      },
    }),
    getAsset: builder.query({
      query: (id) => `/assets/${id}`,
      providesTags: (result, error, id) => [{ type: "Asset", id }],
    }),
    addNewAsset: builder.mutation({
      query: (initialData) => ({
        url: "/assets",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "Asset", id: "LIST" }],
    }),
    updateAsset: builder.mutation({
      query: (data) => ({
        url: "/assets",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Asset", id: arg.id },
        { type: "Asset", id: "LIST" },
      ],
    }),
    deleteAsset: builder.mutation({
      query: ({ id }) => ({
        url: "/assets",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Asset", id: arg.id },
        { type: "Asset", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useAddNewAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApiSlice;

export const selectAssetsResult = assetsApiSlice.endpoints.getAssets.select();

const selectAssetsData = createSelector(
  selectAssetsResult,
  (assetsResult) => assetsResult.data
);

export const {
  selectAll: selectAllAssets,
  selectById: selectAssetById,
  selectIds: selectAssetIds,
} = assetsAdapter.getSelectors(
  (state) => selectAssetsData(state) ?? initialState
);
