import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { ROLES } from "./config/roles";
import LoadingSpinner from "./components/LoadingSpinner";

// Eagerly load critical components
import Layout from "./components/Layout";
import DashLayout from "./components/DashLayout";
import PresistLogin from "./features/auth/PresistLogin";
import PreFetch from "./features/auth/PreFetch";
import RequireAuth from "./features/auth/RequireAuth";

// Lazy load all other components
const Welcome = lazy(() => import("./pages/Welcome"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./features/auth/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Sticker = lazy(() => import("./components/Sticker"));

// Lists
const UsersList = lazy(() => import("./features/users/UsersList"));
const OutgoingsList = lazy(() => import("./features/outgoings/OutgoingsList"));
const IncomingsList = lazy(() => import("./features/incomings/IncomingsList"));
const DeathcasesList = lazy(() => import("./features/deathCases/deathCasesList"));
const PrisoncasesList = lazy(() => import("./features/prisonCases/prisonCasesList"));
const AssetsList = lazy(() => import("./features/assets/AssetsList"));
const PurchaseOrdersList = lazy(() => import("./features/purchaseOrders/PurchaseOrdersList"));
const LogsList = lazy(() => import("./features/logger/LogsList"));

// Edit Forms
const EditUserForm = lazy(() => import("./features/users/EditUserForm"));
const EditIncomingForm = lazy(() => import("./features/incomings/EditIncomingForm"));
const EditOutgoingForm = lazy(() => import("./features/outgoings/EditOutgoingForm"));
const EditDeathcaseForm = lazy(() => import("./features/deathCases/EditDeathCaseForm"));
const EditPrisonCaseForm = lazy(() => import("./features/prisonCases/EditPrisonCaseForm"));
const EditAssetForm = lazy(() => import("./features/assets/EditAssetForm"));
const EditPurchaseOrderForm = lazy(() => import("./features/purchaseOrders/EditPurchaseOrderForm"));

// Add Forms
const AddUserForm = lazy(() => import("./features/users/AddUserForm"));
const AddIncomingForm = lazy(() => import("./features/incomings/AddIncomingForm"));
const AddOutgoingForm = lazy(() => import("./features/outgoings/AddOutgoingForm"));
const AddDeathcaseForm = lazy(() => import("./features/deathCases/AddDeathcaseForm"));
const AddPrisonCaseForm = lazy(() => import("./features/prisonCases/AddPrisonCaseForm"));
const AddAssetForm = lazy(() => import("./features/assets/AddAssetForm"));
const AddPurchaseOrderForm = lazy(() => import("./features/purchaseOrders/AddPurchaseOrderForm"));

// Collection Orders
const CollectionOrdersList = lazy(() => import("./features/collectionOrders/CollectionOrdersList"));
const AddCollectionOrderForm = lazy(() => import("./features/collectionOrders/AddCollectionOrderForm"));
const EditCollectionOrderForm = lazy(() => import("./features/collectionOrders/EditCollectionOrderForm"));

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
      <Suspense fallback={<LoadingSpinner />}>
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
                    {/* /collectionorders */}
                    <Route path="collectionorders">
                      <Route index element={<CollectionOrdersList />} />
                      <Route path="add" element={<AddCollectionOrderForm />} />
                      <Route path="edit/:id" element={<EditCollectionOrderForm />} />
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
      </Suspense>
    </div>
  );
}

export default App;
