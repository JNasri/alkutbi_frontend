import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const collectionOrdersAdapter = createEntityAdapter({});
const initialState = collectionOrdersAdapter.getInitialState();

export const collectionOrdersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCollectionOrders: builder.query({
      query: () => "/collectionorders",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => {
        const loadedCollectionOrders = responseData.map((collectionOrder) => {
          collectionOrder.id = collectionOrder._id;
          return collectionOrder;
        });
        return collectionOrdersAdapter.setAll(initialState, loadedCollectionOrders);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "CollectionOrder", id: "LIST" },
            ...result.ids.map((id) => ({ type: "CollectionOrder", id })),
          ];
        } else return [{ type: "CollectionOrder", id: "LIST" }];
      },
    }),

    getCollectionOrder: builder.query({
      query: (id) => `/collectionorders/${id}`,
      providesTags: (result, error, id) => [{ type: "CollectionOrder", id }],
    }),

    addNewCollectionOrder: builder.mutation({
      query: (initialData) => ({
        url: "/collectionorders",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "CollectionOrder", id: "LIST" }],
    }),

    updateCollectionOrder: builder.mutation({
      query: (updatedData) => ({
        url: "/collectionorders",
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CollectionOrder", id: arg.id },
        { type: "CollectionOrder", id: "LIST" },
      ],
    }),

    deleteCollectionOrder: builder.mutation({
      query: ({ id }) => ({
        url: "/collectionorders",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CollectionOrder", id: arg.id },
        { type: "CollectionOrder", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCollectionOrdersQuery,
  useGetCollectionOrderQuery,
  useAddNewCollectionOrderMutation,
  useUpdateCollectionOrderMutation,
  useDeleteCollectionOrderMutation,
} = collectionOrdersApiSlice;

// Select the query result object
export const selectCollectionOrdersResult =
  collectionOrdersApiSlice.endpoints.getCollectionOrders.select();

// Memoized selector
const selectCollectionOrdersData = createSelector(
  selectCollectionOrdersResult,
  (collectionOrdersResult) => collectionOrdersResult.data
);

// Entity adapter selectors
export const {
  selectAll: selectAllCollectionOrders,
  selectById: selectCollectionOrderById,
  selectIds: selectCollectionOrderIds,
} = collectionOrdersAdapter.getSelectors(
  (state) => selectCollectionOrdersData(state) ?? initialState
);
