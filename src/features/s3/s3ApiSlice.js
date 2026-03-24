import { apiSlice } from "../../app/api/apiSlice";

export const s3ApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSignedUrl: builder.mutation({
      query: (key) => ({
        url: "/s3/sign",
        method: "POST",
        body: { key },
      }),
    }),
  }),
});

export const { useGetSignedUrlMutation } = s3ApiSlice;
