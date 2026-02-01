import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "../../features/auth/authSlice";
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // args: request url, method, body
  // api: signal, dispatch, getState()
  // extraOptions: custome like {shout: ture}.... etc

  // this should work first
  let result = await baseQuery(args, api, extraOptions);
  // if not, we try to get the refresh token if its valid
  if (result?.error?.status === 403) {
    // console.log("sending refresh token");
    // send refresh token to get access token
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);
    // found refresh token? :
    if (refreshResult?.data) {
      // store the refresh token
      api.dispatch(setCredentials({ ...refreshResult.data }));
      // return the baseQuery
      result = await baseQuery(args, api, extraOptions);
      // did not found refresh token? most likely expired :
    } else {
      if (refreshResult?.error?.status === 403) {
        refreshResult.error.data.message = "Your login has expired.";
      }
      return refreshResult;
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Voucher",
    "User",
    "Incoming",
    "Outgoing",
    "DeathCase",
    "PrisonCase",
    "Asset",
    "PurchaseOrder",
    "PurchaseOrderItem",
    "CollectionOrder",
    "CollectionOrderItem",
  ],
  endpoints: (builder) => ({}),
});
