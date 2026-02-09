import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const incomingsAdapter = createEntityAdapter({});
const initialState = incomingsAdapter.getInitialState();

export const incomingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIncomings: builder.query({
      query: () => "/incomings",
      validateStatus: (response, result) =>
        response.status === 200 && !result.isError,
      transformResponse: (responseData) => {
        const loadedIncomings = responseData.map((incoming) => {
          incoming.id = incoming._id;
          return incoming;
        });
        return incomingsAdapter.setAll(initialState, loadedIncomings);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Incoming", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Incoming", id })),
          ];
        } else return [{ type: "Incoming", id: "LIST" }];
      },
    }),

    // ✅ NEW: get a single incoming by ID
    getIncoming: builder.query({
      query: (id) => `/incomings/${id}`,
      providesTags: (result, error, id) => [{ type: "Incoming", id }],
    }),

    addNewIncoming: builder.mutation({
      query: (initialData) => ({
        url: "/incomings",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "Incoming", id: "LIST" }],
    }),

    updateIncoming: builder.mutation({
      query: (updatedData) => ({
        url: "/incomings",
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Incoming", id: arg.id },
        { type: "Incoming", id: "LIST" },
      ],
    }),

    deleteIncoming: builder.mutation({
      query: ({ id }) => ({
        url: "/incomings",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Incoming", id: arg.id },
        { type: "Incoming", id: "LIST" }, // Invalidate the list so it's refreshed
      ],
    }),
  }),
});

export const {
  useGetIncomingsQuery,
  useGetIncomingQuery, // ✅ export new hook
  useAddNewIncomingMutation,
  useUpdateIncomingMutation,
  useDeleteIncomingMutation,
} = incomingsApiSlice;

// Select the query result object
export const selectIncomingsResult =
  incomingsApiSlice.endpoints.getIncomings.select();

// Memoized selector
const selectIncomingsData = createSelector(
  selectIncomingsResult,
  (incomingsResult) => incomingsResult.data
);

// Entity adapter selectors
export const {
  selectAll: selectAllIncomings,
  selectById: selectIncomingById,
  selectIds: selectIncomingIds,
} = incomingsAdapter.getSelectors(
  (state) => selectIncomingsData(state) ?? initialState
);
