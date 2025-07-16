import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const vouchersAdapter = createEntityAdapter({});
const initialState = vouchersAdapter.getInitialState();

export const vouchersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getvouchers: builder.query({
      query: () => "/vouchers",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedvouchers = responseData.map((voucher) => {
          voucher.id = voucher._id;
          return voucher;
        });
        return vouchersAdapter.setAll(initialState, loadedvouchers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "voucher", id: "LIST" },
            ...result.ids.map((id) => ({ type: "voucher", id })),
          ];
        } else return [{ type: "voucher", id: "LIST" }];
      },
    }),
    // addNewVoucher: builder.mutation({
    //   query: (initialVoucherData) => ({
    //     url: "/vouchers",
    //     method: "POST",
    //     body: {
    //       ...initialVoucherData,
    //     },
    //   }),
    //   invalidatesTags: [{ type: "voucher", id: "LIST" }],
    // }),
    addNewVoucher: builder.mutation({
      query: (initialVoucherData) => {
        const formData = new FormData();

        // Loop through all keys of the initialVoucherData
        for (const key in initialVoucherData) {
          if (key === "movements") {
            // If it's the movements array, stringify it before appending
            formData.append(key, JSON.stringify(initialVoucherData[key]));
          } else if (key === "file" && initialVoucherData.file) {
            // If it's the file, append it to the form data
            formData.append("file", initialVoucherData.file);
          } else if (key === "NumOfMovements") {
            formData.append(key, initialVoucherData[key]); // Ensure it is appended
          } else {
            // For all other fields, append them directly
            formData.append(key, initialVoucherData[key]);
          }
        }

        // Logging FormData entries for debugging
        // for (let pair of formData.entries()) {
        //   console.log(pair[0] + ": " + pair[1]);
        // }

        return {
          url: "/vouchers",
          method: "POST",
          body: formData, // Use FormData as the body for the request
        };
      },
      invalidatesTags: [{ type: "voucher", id: "LIST" }],
    }),
    updateVoucher: builder.mutation({
      query: (initialVoucherData) => {
        const formData = new FormData();

        // Loop through all keys of the initialVoucherData
        for (const key in initialVoucherData) {
          if (key === "movements") {
            // If it's the movements array, stringify it before appending
            formData.append(key, JSON.stringify(initialVoucherData[key]));
          } else if (key === "file" && initialVoucherData.file) {
            // If it's the file, append it to the form data
            formData.append("file", initialVoucherData.file);
          } else if (key === "NumOfMovements") {
            formData.append(key, initialVoucherData[key]); // Ensure it is appended
          } else {
            // For all other fields, append them directly
            formData.append(key, initialVoucherData[key]);
          }
        }

        // Logging FormData entries for debugging
        // for (let pair of formData.entries()) {
        //   console.log(pair[0] + ": " + pair[1]);
        // }

        return {
          url: `/vouchers/${initialVoucherData.id}`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "voucher", id: arg.id },
      ],
    }),
    deleteVoucher: builder.mutation({
      query: ({ id }) => ({
        url: `/vouchers`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "voucher", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetvouchersQuery,
  useAddNewVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
} = vouchersApiSlice;

// return the query result object
export const selectvouchersResult =
  vouchersApiSlice.endpoints.getvouchers.select();

// creates a memoized selector
const selectVouchersData = createSelector(
  selectvouchersResult,
  (vouchersResult) => vouchersResult.data
);

// getSelectors creates these selectors and we rename them to reduce bytes in our component files
export const {
  selectAll: selectAllVouchers,
  selectById: selectVoucherById,
  selectIds: selectVoucherIds,
} = vouchersAdapter.getSelectors(
  (state) => selectVouchersData(state) ?? initialState
);
