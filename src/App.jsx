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
import OutgoingsList from "./features/Outgoings/OutgoingsList";
import IncomingsList from "./features/Incomings/IncomingsList";
// edits
import EditUserForm from "./features/users/EditUserForm";
import EditIncomingForm from "./features/Incomings/EditIncomingForm";
import EditOutgoingForm from "./features/Outgoings/EditOutgoingForm";
// adds
import AddUserForm from "./features/users/AddUserForm";
import AddIncomingForm from "./features/Incomings/AddIncomingForm";
import AddOutgoingForm from "./features/Outgoings/AddOutgoingForm";
// not found
import NotFound from "./pages/NotFound";
// sticker
import Sticker from "./components/Sticker";
//
// // PrimeReact core styles
// import "primereact/resources/themes/lara-light-indigo/theme.css"; // or sakai theme if you get it
// import "primereact/resources/primereact.min.css";
// // PrimeIcons
// import "primeicons/primeicons.css";
// // PrimeFlex utility classes
// import "primeflex/primeflex.css";

function App() {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* PUBLIC */}
        {/* welcome page + login */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
          <Route path="login" element={<Login />} />

          {/* PRIVATE */}
          <Route element={<PresistLogin />}>
            {/* /dashboard */}
            <Route element={<PreFetch />}>
              <Route path="/sticker" element={<Sticker />} />
              <Route path="dashboard" element={<DashLayout />}>
                {/* / */}
                <Route index element={<Home />} />
                {/* /users */}
                <Route path="users">
                  <Route index element={<UsersList />} />
                  <Route path="edit/:id" element={<EditUserForm />} />
                  <Route path="add" element={<AddUserForm />} />
                </Route>
                {/* /incomings */}
                <Route path="incomings">
                  <Route index element={<IncomingsList />} />
                  <Route path="add" element={<AddIncomingForm />} />
                  <Route path="edit/:id" element={<EditIncomingForm />} />
                </Route>
                {/* /outgoings */}
                <Route path="outgoings">
                  <Route index element={<OutgoingsList />} />
                  <Route path="add" element={<AddOutgoingForm />} />
                  <Route path="edit/:id" element={<EditOutgoingForm />} />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
