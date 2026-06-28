import { apiSlice } from "../../app/api/apiSlice";

export const monthlyReviewsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMonthlyReviewWorkspace: builder.query({
      query: (month) => `/monthlyreviews/workspace?month=${month}`,
      providesTags: (result, error, month) => [
        { type: "MonthlyReview", id: month },
        { type: "MonthlyReview", id: "LIST" },
      ],
    }),
    saveMonthlyReview: builder.mutation({
      query: (reviewData) => ({
        url: "/monthlyreviews",
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MonthlyReview", id: arg.month },
        { type: "MonthlyReview", id: "LIST" },
      ],
    }),
    deleteMonthlyReview: builder.mutation({
      query: ({ id }) => ({
        url: `/monthlyreviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MonthlyReview", id: arg.month },
        { type: "MonthlyReview", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMonthlyReviewWorkspaceQuery,
  useSaveMonthlyReviewMutation,
  useDeleteMonthlyReviewMutation,
} = monthlyReviewsApiSlice;
