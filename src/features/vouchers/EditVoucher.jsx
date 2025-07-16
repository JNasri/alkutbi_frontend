import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectVoucherById } from "./vouchersApiSlice";
import EditVoucherForm from "./EditVoucherForm";

const EditVoucher = () => {
  const { id } = useParams();

  const voucher = useSelector((state) => selectVoucherById(state, id));

  const content = voucher ? (
    <EditVoucherForm voucher={voucher} />
  ) : (
    <p>Loading...</p>
  );

  return content;
};

export default EditVoucher;
