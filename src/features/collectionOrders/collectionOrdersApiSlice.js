import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const collectionOrdersAdapter = createEntityAdapter({});
const initialState = collectionOrdersAdapter.getInitialState();

const buildCollectionOrdersTableQuery = (args = {}) => {
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

  return `/collectionorders?${params.toString()}`;
};

const buildCollectionOrdersExportQuery = (args = {}) => {
  const params = new URLSearchParams();
  params.set("mode", "tableExport");
  params.set("scope", args.scope || "today");

  if (args.search) params.set("search", args.search);
  if (args.sortField) params.set("sortField", args.sortField);
  if (args.sortOrder) params.set("sortOrder", args.sortOrder);
  if (args.filters && Object.keys(args.filters).length) {
    params.set("filters", JSON.stringify(args.filters));
  }

  return `/collectionorders?${params.toString()}`;
};

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

    getCollectionOrdersTable: builder.query({
      query: buildCollectionOrdersTableQuery,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => ({
        ...responseData,
        data: (responseData.data || []).map((collectionOrder) => ({
          ...collectionOrder,
          id: collectionOrder.id || collectionOrder._id,
        })),
      }),
      providesTags: [{ type: "CollectionOrder", id: "LIST" }],
    }),

    getCollectionOrdersExport: builder.query({
      query: buildCollectionOrdersExportQuery,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => ({
        ...responseData,
        data: (responseData.data || []).map((collectionOrder) => ({
          ...collectionOrder,
          id: collectionOrder.id || collectionOrder._id,
        })),
      }),
      keepUnusedDataFor: 0,
    }),

    getCollectionOrderOptions: builder.query({
      query: () => "/collectionorders/options",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      providesTags: [{ type: "CollectionOrder", id: "OPTIONS" }],
    }),

    getCollectionOrder: builder.query({
      query: (id) => `/collectionorders/${id}`,
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => ({
        ...responseData,
        id: responseData._id,
      }),
      providesTags: (result, error, id) => [{ type: "CollectionOrder", id }],
    }),

    addNewCollectionOrder: builder.mutation({
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
          url: "/collectionorders",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "CollectionOrder", id: "LIST" },
        { type: "CollectionOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    updateCollectionOrder: builder.mutation({
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
          url: "/collectionorders",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "CollectionOrder", id: arg.id },
        { type: "CollectionOrder", id: "LIST" },
        { type: "CollectionOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
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
        { type: "CollectionOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    restoreCollectionOrder: builder.mutation({
      query: ({ id }) => ({
        url: "/collectionorders/restore",
        method: "PATCH",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CollectionOrder", id: arg.id },
        { type: "CollectionOrder", id: "LIST" },
        { type: "CollectionOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),

    addBulkCollectionOrders: builder.mutation({
      query: (orders) => ({
        url: "/collectionorders/bulk",
        method: "POST",
        body: { orders },
      }),
      invalidatesTags: [
        { type: "CollectionOrder", id: "LIST" },
        { type: "CollectionOrder", id: "OPTIONS" },
        { type: "Dashboard", id: "ORDERS_SUMMARY" },
        { type: "Bank", id: "SUMMARY" },
      ],
    }),
  }),
});

export const {
  useGetCollectionOrdersQuery,
  useGetCollectionOrdersTableQuery,
  useLazyGetCollectionOrdersExportQuery,
  useGetCollectionOrderOptionsQuery,
  useGetCollectionOrderQuery,
  useAddNewCollectionOrderMutation,
  useUpdateCollectionOrderMutation,
  useDeleteCollectionOrderMutation,
  useRestoreCollectionOrderMutation,
  useAddBulkCollectionOrdersMutation,
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
