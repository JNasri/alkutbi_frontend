import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectVoucherById } from "./vouchersApiSlice";
import { getStatusRowColor } from "./getStatusRowColor";
import useAuth from "../../hooks/useAuth";

const Voucher = ({ voucherId }) => {
  const { isOperationEmployee, isAdmin, isOperationManager } = useAuth();
  const voucher = useSelector((state) => selectVoucherById(state, voucherId));
  const navigate = useNavigate();

  if (voucher) {
    const handleEdit = () => navigate(`/dash/vouchers/${voucherId}`);

    return (
      <tr className={getStatusRowColor(voucher.voucherStatus)}>
        <td className="px-6 py-4 font-medium  whitespace-nowrap text-white">
          {voucher.operationNumber}
        </td>
        <td className="px-6 py-4 font-medium  whitespace-nowrap text-white">
          {voucher.voucherStatus}
        </td>
        <td className="px-6 py-4 font-medium  whitespace-nowrap text-white">
          {voucher.agentName}
        </td>
        <td className="px-6 py-4 font-medium  whitespace-nowrap text-white">
          {voucher.movements.map((m) => m.type).join(", ")}
        </td>
        <td className="px-6 py-4 font-medium  whitespace-nowrap text-white">
          <button
            className="  text-white font-bold py-2 px-4 rounded cursor-pointer"
            onClick={() => window.open(voucher.fileUrl, "_blank")}
          >
            ⬇️
          </button>
        </td>
        {(isOperationManager || isOperationEmployee) && (
          <td className="px-6 py-4 font-medium  whitespace-nowrap text-white">
            <button
              className="  text-white font-bold py-2 px-4 rounded cursor-pointer"
              onClick={handleEdit}
            >
              ✏️
            </button>
          </td>
        )}
      </tr>
    );
  } else return null;
};

export default Voucher;
