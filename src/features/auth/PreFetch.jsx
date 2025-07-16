import { store } from "../../app/store";
import { vouchersApiSlice } from "../vouchers/vouchersApiSlice";
import { usersApiSlice } from "../users/usersApiSlice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const PreFetch = () => {
  useEffect(() => {
    // console.log("subscribing");
    const vouchers = store.dispatch(
      vouchersApiSlice.endpoints.getvouchers.initiate()
    );
    const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate());
    return () => {
      // console.log("unsubscribing");
      vouchers.unsubscribe();
      users.unsubscribe();
    };
  }, []);

  return <Outlet />;
};

export default PreFetch;
