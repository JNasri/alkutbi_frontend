import { apiSlice } from "../../app/api/apiSlice";

export const logsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLogs: builder.query({
      query: () => "/logs",
      transformResponse: (responseData) => {
        // responseData = { logs: "..." }
        return responseData.logs;
      },
      providesTags: ["Logs"],
    }),
  }),
});

export const { useGetLogsQuery } = logsApiSlice;
