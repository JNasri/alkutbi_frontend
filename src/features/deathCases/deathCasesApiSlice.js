import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const deathcasesAdapter = createEntityAdapter({});
const initialState = deathcasesAdapter.getInitialState();

export const deathCasesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeathcases: builder.query({
      query: () => "/deathcases",
      validateStatus: (response, result) =>
        response.status === 200 && !result?.isError,
      transformResponse: (responseData) => {
        const loaded = responseData.map((dc) => {
          dc.id = dc._id;
          return dc;
        });
        return deathcasesAdapter.setAll(initialState, loaded);
      },
      providesTags: (result) =>
        result?.ids
          ? [
              { type: "Deathcase", id: "LIST" },
              ...result.ids.map((id) => ({ type: "Deathcase", id })),
            ]
          : [{ type: "Deathcase", id: "LIST" }],
    }),

    // Single deathcase by id
    getDeathcase: builder.query({
      query: (id) => `/deathcases/${id}`,
      providesTags: (result, error, id) => [{ type: "Deathcase", id }],
    }),

    addNewDeathcase: builder.mutation({
      query: (initialData) => ({
        url: "/deathcases",
        method: "POST",
        body: initialData, // FormData supported by baseQuery
      }),
      invalidatesTags: [{ type: "Deathcase", id: "LIST" }],
    }),

    updateDeathcase: builder.mutation({
      query: (updatedData) => ({
        url: "/deathcases",
        method: "PATCH",
        body: updatedData, // FormData with id & fields
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Deathcase", id: arg.id },
      ],
    }),

    deleteDeathcase: builder.mutation({
      query: ({ id }) => ({
        url: "/deathcases",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Deathcase", id: arg.id },
        { type: "Deathcase", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDeathcasesQuery,
  useGetDeathcaseQuery,
  useAddNewDeathcaseMutation,
  useUpdateDeathcaseMutation,
  useDeleteDeathcaseMutation,
} = deathCasesApiSlice;

// Select the query result object
export const selectDeathcasesResult =
  deathCasesApiSlice.endpoints.getDeathcases.select();

// Memoized selector
const selectDeathcasesData = createSelector(
  selectDeathcasesResult,
  (res) => res.data
);

// Entity adapter selectors
export const {
  selectAll: selectAllDeathcases,
  selectById: selectDeathcaseById,
  selectIds: selectDeathcaseIds,
} = deathcasesAdapter.getSelectors(
  (state) => selectDeathcasesData(state) ?? initialState
);
