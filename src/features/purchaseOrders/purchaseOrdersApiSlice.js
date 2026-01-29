import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const purchaseOrdersAdapter = createEntityAdapter({});
const initialState = purchaseOrdersAdapter.getInitialState();

export const purchaseOrdersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query({
      query: () => "/purchaseorders",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => {
        const loadedPurchaseOrders = responseData.map((purchaseOrder) => {
          purchaseOrder.id = purchaseOrder._id;
          return purchaseOrder;
        });
        return purchaseOrdersAdapter.setAll(initialState, loadedPurchaseOrders);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "PurchaseOrder", id: "LIST" },
            ...result.ids.map((id) => ({ type: "PurchaseOrder", id })),
          ];
        } else return [{ type: "PurchaseOrder", id: "LIST" }];
      },
    }),

    getPurchaseOrder: builder.query({
      query: (id) => `/purchaseorders/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseOrder", id }],
    }),

    addNewPurchaseOrder: builder.mutation({
      query: (initialData) => ({
        url: "/purchaseorders",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    updatePurchaseOrder: builder.mutation({
      query: (updatedData) => ({
        url: "/purchaseorders",
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PurchaseOrder", id: arg.id },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),

    deletePurchaseOrder: builder.mutation({
      query: ({ id }) => ({
        url: "/purchaseorders",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PurchaseOrder", id: arg.id },
        { type: "PurchaseOrder", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useAddNewPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrdersApiSlice;

// Select the query result object
export const selectPurchaseOrdersResult =
  purchaseOrdersApiSlice.endpoints.getPurchaseOrders.select();

// Memoized selector
const selectPurchaseOrdersData = createSelector(
  selectPurchaseOrdersResult,
  (purchaseOrdersResult) => purchaseOrdersResult.data
);

// Entity adapter selectors
export const {
  selectAll: selectAllPurchaseOrders,
  selectById: selectPurchaseOrderById,
  selectIds: selectPurchaseOrderIds,
} = purchaseOrdersAdapter.getSelectors(
  (state) => selectPurchaseOrdersData(state) ?? initialState
);
