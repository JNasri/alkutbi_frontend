import { store } from "../../app/store";
import { vouchersApiSlice } from "../vouchers/vouchersApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { incomingsApiSlice } from "../incomings/incomingsApiSlice";
import { outgoingsApiSlice } from "../outgoings/outgoingsApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const PreFetch = () => {
  useEffect(() => {
    store.dispatch(
      usersApiSlice.util.prefetch("getUsers", "usersList", { force: true })
    );
    store.dispatch(
      vouchersApiSlice.util.prefetch("getvouchers", "vouchersList", {
        force: true,
      })
    );
    store.dispatch(
      incomingsApiSlice.util.prefetch("getIncomings", "incomingsList", {
        force: true,
      })
    );
    store.dispatch(
      outgoingsApiSlice.util.prefetch("getOutgoings", "outgoingsList", {
        force: true,
      })
    );
  }, []);

  return <Outlet />;
};

export default PreFetch;
