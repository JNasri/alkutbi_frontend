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
import IncomingsList from "./features/Incomings/IncomingsList";
// edits
import EditUserForm from "./features/users/EditUserForm";
import EditIncomingForm from "./features/Incomings/EditIncomingForm";
import EditOutgoingForm from "./features/Outgoings/EditOutgoingForm";
// adds
import AddUserForm from "./features/users/AddUserForm";
import AddIncomingForm from "./features/Incomings/AddIncomingForm";
import AddOutgoingForm from "./features/Outgoings/AddOutgoingForm";
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
