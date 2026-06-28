import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const purchaseOrdersAdapter = createEntityAdapter({});
const initialState = purchaseOrdersAdapter.getInitialState();

const buildPurchaseOrdersTableQuery = (args = {}) => {
  const params = new URLSearchParams();
  params.set("mode", "table");
  params.set("page", args.page || 1);
  params.set("limit", args.limit || 10);
  params.set("scope", args.scope || "today");

  if (args.search) params.set("search", args.search);
  if (args.sortField) params.set("sortField", args.sortField);
  if (args.sortOrder) params.set("sortOrder", args.sortOrder);
  if (args.filters && Object.keys(args.filters).length) {
    params.set("filters", JSON.stringify(args.filters));
  }

  return `/purchaseorders?${params.toString()}`;
};

const buildPurchaseOrdersExportQuery = (args = {}) => {
  const params = new URLSearchParams();
  params.set("mode", "tableExport");
  params.set("scope", args.scope || "today");

  if (args.search) params.set("search", args.search);
  if (args.sortField) params.set("sortField", args.sortField);
  if (args.sortOrder) params.set("sortOrder", args.sortOrder);
  if (args.filters && Object.keys(args.filters).length) {
    params.set("filters", JSON.stringify(args.filters));
  }

  return `/purchaseorders?${params.toString()}`;
};

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

    getPurchaseOrdersTable: builder.query({
      query: buildPurchaseOrdersTableQuery,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => ({
        ...responseData,
        data: (responseData.data || []).map((purchaseOrder) => ({
          ...purchaseOrder,
          id: purchaseOrder.id || purchaseOrder._id,
        })),
      }),
      providesTags: [{ type: "PurchaseOrder", id: "LIST" }],
    }),

    getPurchaseOrdersExport: builder.query({
      query: buildPurchaseOrdersExportQuery,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => ({
        ...responseData,
        data: (responseData.data || []).map((purchaseOrder) => ({
          ...purchaseOrder,
          id: purchaseOrder.id || purchaseOrder._id,
        })),
      }),
      keepUnusedDataFor: 0,
    }),

    getPurchaseOrderOptions: builder.query({
      query: () => "/purchaseorders/options",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      providesTags: [{ type: "PurchaseOrder", id: "OPTIONS" }],
    }),

    getPurchaseOrder: builder.query({
      query: (id) => `/purchaseorders/${id}`,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => ({
        ...responseData,
        id: responseData._id,
      }),
      providesTags: (result, error, id) => [{ type: "PurchaseOrder", id }],
    }),

    addNewPurchaseOrder: builder.mutation({
      query: (initialData) => {
        const formData = new FormData();
        for (const key in initialData) {
          if (key === "file" && initialData[key]) {
            formData.append("file", initialData[key]);
          } else {
            formData.append(key, initialData[key]);
          }
        }
        return {
          url: "/purchaseorders",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    addBulkPurchaseOrders: builder.mutation({
      query: (orders) => ({
        url: "/purchaseorders/bulk",
        method: "POST",
        body: { orders },
      }),
      invalidatesTags: [
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    updatePurchaseOrder: builder.mutation({
      query: (updatedData) => {
        const formData = new FormData();
        for (const key in updatedData) {
          if (key === "file" && updatedData[key]) {
            formData.append("file", updatedData[key]);
          } else {
            formData.append(key, updatedData[key]);
          }
        }
        return {
          url: "/purchaseorders",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PurchaseOrder", id: arg.id },
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    updatePurchaseOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: "/purchaseorders/status",
        method: "PATCH",
        body: { id, status },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PurchaseOrder", id: arg.id },
        { type: "PurchaseOrder", id: "LIST" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
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
        { type: "PurchaseOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    restorePurchaseOrder: builder.mutation({
      query: ({ id }) => ({
        url: "/purchaseorders/restore",
        method: "PATCH",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PurchaseOrder", id: arg.id },
        { type: "PurchaseOrder", id: "LIST" },
        { type: "PurchaseOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrdersTableQuery,
  useLazyGetPurchaseOrdersExportQuery,
  useGetPurchaseOrderOptionsQuery,
  useGetPurchaseOrderQuery,
  useAddNewPurchaseOrderMutation,
  useAddBulkPurchaseOrdersMutation,
  useUpdatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useDeletePurchaseOrderMutation,
  useRestorePurchaseOrderMutation,
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
