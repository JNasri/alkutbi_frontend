import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const outgoingsAdapter = createEntityAdapter({});
const initialState = outgoingsAdapter.getInitialState();

export const outgoingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOutgoings: builder.query({
      query: () => "/outgoings",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => {
        const loadedOutgoings = responseData.map((item) => {
          item.id = item._id;
          return item;
        });
        return outgoingsAdapter.setAll(initialState, loadedOutgoings);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Outgoing", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Outgoing", id })),
          ];
        } else return [{ type: "Outgoing", id: "LIST" }];
      },
    }),

    // ✅ NEW: get a single outgoing by ID
    getOutgoing: builder.query({
      query: (id) => `/outgoings/${id}`,
      providesTags: (result, error, id) => [{ type: "Outgoing", id }],
    }),

    addNewOutgoing: builder.mutation({
      query: (initialData) => ({
        url: "/outgoings",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "Outgoing", id: "LIST" }],
    }),
    updateOutgoing: builder.mutation({
      query: (data) => ({
        url: "/outgoings",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Outgoing", id: arg.id },
      ],
    }),
    deleteOutgoing: builder.mutation({
      query: ({ id }) => ({
        url: "/outgoings",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Outgoing", id: arg.id },
        { type: "Outgoing", id: "LIST" }, // Invalidate the list so it's refreshed
      ],
    }),
  }),
});

export const {
  useGetOutgoingsQuery,
  useGetOutgoingQuery,
  useAddNewOutgoingMutation,
  useUpdateOutgoingMutation,
  useDeleteOutgoingMutation,
} = outgoingsApiSlice;

export const selectOutgoingsResult =
  outgoingsApiSlice.endpoints.getOutgoings.select();

const selectOutgoingsData = createSelector(
  selectOutgoingsResult,
  (outgoingsResult) => outgoingsResult.data
);

export const {
  selectAll: selectAllOutgoings,
  selectById: selectOutgoingById,
  selectIds: selectOutgoingIds,
} = outgoingsAdapter.getSelectors(
  (state) => selectOutgoingsData(state) ?? initialState
);
