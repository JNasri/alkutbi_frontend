import { useGetvouchersQuery } from "./vouchersApiSlice";
import Voucher from "./Voucher";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAuth from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";

const VoucherList = () => {
  const { isOperationEmployee, isAdmin, isOperationManager } = useAuth();
  const {
    data: vouchers,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetvouchersQuery("vouchersList", {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  let content;
  if (isLoading)
    content = (
      <>
        <PageHeader text="VoucerhList" />
        <LoadingSpinner />
      </>
    );
  else if (isError)
    content = (
      <div
        className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
        role="alert"
      >
        <span className="font-medium">Alert! :</span> {error?.data?.message}
      </div>
    );
  else if (isSuccess) {
    const { ids } = vouchers;
    const tableContent = ids?.length
      ? ids.map((voucherId) => (
          <Voucher key={voucherId} voucherId={voucherId} />
        ))
      : null;

    content = (
      <>
        <PageHeader text="VoucerhList" />
        <table className="w-full text-sm rtl:text-right text-gray-500 dark:text-gray-400 shadow-lg overflow-hidden text-left">
          <thead className="text-md uppercase bg-gray-900 text-white">
            <tr>
              <th scope="col" className="px-6 py-3">
                Operation Number
              </th>
              <th scope="col" className="px-6 py-3">
                Operation Status
              </th>
              <th scope="col" className="px-6 py-3">
                Agent Name
              </th>
              <th scope="col" className="px-6 py-3">
                Movements
              </th>
              <th scope="col" className="px-6 py-3">
                Voucher File
              </th>
              {(isOperationManager || isOperationEmployee) && (
                <th scope="col" className="px-6 py-3">
                  Edit
                </th>
              )}
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </>
    );
  }

  return content;
};

export default VoucherList;
