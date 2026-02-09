import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const prisoncasesAdapter = createEntityAdapter({});
const initialState = prisoncasesAdapter.getInitialState();

export const prisoncasesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPrisoncases: builder.query({
      query: () => "/prisoncases",
      validateStatus: (response, result) =>
        response.status === 200 && !result?.isError,
      transformResponse: (responseData) => {
        const loaded = responseData.map((pc) => {
          pc.id = pc._id;
          return pc;
        });
        return prisoncasesAdapter.setAll(initialState, loaded);
      },
      providesTags: (result) =>
        result?.ids
          ? [
              { type: "PrisonCase", id: "LIST" },
              ...result.ids.map((id) => ({ type: "PrisonCase", id })),
            ]
          : [{ type: "PrisonCase", id: "LIST" }],
    }),

    getPrisoncase: builder.query({
      query: (id) => `/prisoncases/${id}`,
      providesTags: (result, error, id) => [{ type: "PrisonCase", id }],
    }),

    addNewPrisoncase: builder.mutation({
      query: (initialData) => ({
        url: "/prisoncases",
        method: "POST",
        body: initialData,
      }),
      invalidatesTags: [{ type: "PrisonCase", id: "LIST" }],
    }),

    updatePrisoncase: builder.mutation({
      query: (updatedData) => ({
        url: "/prisoncases",
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PrisonCase", id: arg.id },
        { type: "PrisonCase", id: "LIST" },
      ],
    }),

    deletePrisoncase: builder.mutation({
      query: ({ id }) => ({
        url: "/prisoncases",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PrisonCase", id: arg.id },
        { type: "PrisonCase", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPrisoncasesQuery,
  useGetPrisoncaseQuery,
  useAddNewPrisoncaseMutation,
  useUpdatePrisoncaseMutation,
  useDeletePrisoncaseMutation,
} = prisoncasesApiSlice;

// Select the query result object
export const selectPrisoncasesResult = prisoncasesApiSlice.endpoints.getPrisoncases.select();

// Memoized selector
const selectPrisoncasesData = createSelector(
  selectPrisoncasesResult,
  (res) => res.data
);

// Entity adapter selectors
export const {
  selectAll: selectAllPrisoncases,
  selectById: selectPrisoncaseById,
  selectIds: selectPrisoncaseIds,
} = prisoncasesAdapter.getSelectors(
  (state) => selectPrisoncasesData(state) ?? initialState
);
