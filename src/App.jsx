import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import DashLayout from "./components/DashLayout";
import Home from "./features/auth/Home";
import PresistLogin from "./features/auth/PresistLogin";
import PreFetch from "./features/auth/PreFetch";
import { Toaster } from "react-hot-toast";
// lists
import UsersList from "./features/users/UsersList";
import OutgoingsList from "./features/outgoings/OutgoingsList";
import IncomingsList from "./features/incomings/IncomingsList";
import DeathcasesList from "./features/deathCases/deathCasesList";
import PrisoncasesList from "./features/prisonCases/prisonCasesList";
import AssetsList from "./features/assets/AssetsList";
// edits
import EditUserForm from "./features/users/EditUserForm";
import EditIncomingForm from "./features/incomings/EditIncomingForm";
import EditOutgoingForm from "./features/outgoings/EditOutgoingForm";
import EditDeathcaseForm from "./features/deathCases/EditDeathCaseForm";
import EditPrisonCaseForm from "./features/prisonCases/EditPrisonCaseForm";
import EditAssetForm from "./features/assets/EditAssetForm";
// adds
import AddUserForm from "./features/users/AddUserForm";
import AddIncomingForm from "./features/incomings/AddIncomingForm";
import AddOutgoingForm from "./features/outgoings/AddOutgoingForm";
import AddDeathcaseForm from "./features/deathCases/AddDeathCaseForm";
import AddPrisonCaseForm from "./features/prisonCases/AddPrisonCaseForm";
import AddAssetForm from "./features/assets/AddAssetForm";
// purchase orders
import PurchaseOrdersList from "./features/purchaseOrders/PurchaseOrdersList";
import AddPurchaseOrderForm from "./features/purchaseOrders/AddPurchaseOrderForm";
import EditPurchaseOrderForm from "./features/purchaseOrders/EditPurchaseOrderForm";
// logs
import LogsList from "./features/logger/LogsList";
// not found
import NotFound from "./pages/NotFound";
// sticker
import Sticker from "./components/Sticker";
// require auth
import RequireAuth from "./features/auth/RequireAuth";
import { ROLES } from "./config/roles";

//
// // PrimeReact core styles
// import "primereact/resources/themes/lara-light-indigo/theme.css"; // or sakai theme if you get it
// import "primereact/resources/primereact.min.css";
// // PrimeIcons
// import "primeicons/primeicons.css";
// // PrimeFlex utility classes
// import "primeflex/primeflex.css";

// array of special papers [admin,special_papers_manager,special_papers_employee]
const addSpecialPapersRoles = [
  ROLES.Admin,
  ROLES.Special_Papers_Manager,
  ROLES.Special_Papers_Employee,
];
const editSpecialPapersRoles = [ROLES.Admin, ROLES.Special_Papers_Manager];

function App() {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* PUBLIC */}
          {/* welcome page + login */}
          <Route index element={<Welcome />} />
          <Route path="login" element={<Login />} />

          {/* PRIVATE */}
          <Route element={<PresistLogin />}>
            <Route
              element={<RequireAuth allowedRoles={[...Object.values(ROLES)]} />}
            >
              {/* /dashboard */}
              <Route element={<PreFetch />}>
                <Route path="/sticker" element={<Sticker />} />
                <Route path="dashboard" element={<DashLayout />}>
                  {/* / */}
                  <Route index element={<Home />} />
                  {/* /users */}
                  <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                    <Route path="users">
                      <Route index element={<UsersList />} />
                      <Route path="edit/:id" element={<EditUserForm />} />
                      <Route path="add" element={<AddUserForm />} />
                    </Route>
                  </Route>
                  {/* /incomings */}
                  <Route path="incomings">
                    <Route index element={<IncomingsList />} />
                    <Route
                      element={
                        <RequireAuth allowedRoles={addSpecialPapersRoles} />
                      }
                    >
                      <Route path="add" element={<AddIncomingForm />} />
                    </Route>
                    <Route
                      element={
                        <RequireAuth allowedRoles={editSpecialPapersRoles} />
                      }
                    >
                      <Route path="edit/:id" element={<EditIncomingForm />} />
                    </Route>
                  </Route>
                  {/* /outgoings */}
                  <Route path="outgoings">
                    <Route index element={<OutgoingsList />} />
                    <Route
                      element={
                        <RequireAuth allowedRoles={addSpecialPapersRoles} />
                      }
                    >
                      <Route path="add" element={<AddOutgoingForm />} />
                    </Route>
                    <Route
                      element={
                        <RequireAuth allowedRoles={editSpecialPapersRoles} />
                      }
                    >
                      <Route path="edit/:id" element={<EditOutgoingForm />} />
                    </Route>
                  </Route>
                  {/* /deathcases */}
                  <Route path="deathcases">
                    <Route index element={<DeathcasesList />} />
                    <Route
                      element={
                        <RequireAuth allowedRoles={addSpecialPapersRoles} />
                      }
                    >
                      <Route path="add" element={<AddDeathcaseForm />} />
                    </Route>
                    <Route
                      element={
                        <RequireAuth allowedRoles={editSpecialPapersRoles} />
                      }
                    >
                      <Route path="edit/:id" element={<EditDeathcaseForm />} />
                    </Route>
                  </Route>
                  {/* /prisoncases */}
                  <Route path="prisoncases">
                    <Route index element={<PrisoncasesList />} />
                    <Route
                      element={
                        <RequireAuth allowedRoles={addSpecialPapersRoles} />
                      }
                    >
                      <Route path="add" element={<AddPrisonCaseForm />} />
                    </Route>
                    <Route
                      element={
                        <RequireAuth allowedRoles={editSpecialPapersRoles} />
                      }
                    >
                      <Route path="edit/:id" element={<EditPrisonCaseForm />} />
                    </Route>
                  </Route>
                  {/* /assets */}
                  <Route path="assets">
                    <Route index element={<AssetsList />} />
                    <Route path="add" element={<AddAssetForm />} />
                    <Route path="edit/:id" element={<EditAssetForm />} />
                  </Route>
                  {/* /purchaseorders */}
                  <Route path="purchaseorders">
                    <Route index element={<PurchaseOrdersList />} />
                    <Route path="add" element={<AddPurchaseOrderForm />} />
                    <Route path="edit/:id" element={<EditPurchaseOrderForm />} />
                  </Route>
                  {/* /logs */}
                  <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                    <Route path="logs">
                      <Route index element={<LogsList />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
