import { apiSlice } from "../../app/api/apiSlice";

export const userRequestsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestUser: builder.mutation({
      query: (data) => ({
        url: "/requestUser",
        method: "POST",
        body: data,
      }),
    }),
    requestFeature: builder.mutation({
      query: (data) => ({
        url: "/requestUser/feature",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRequestUserMutation,
  useRequestFeatureMutation,
} = userRequestsApiSlice;
