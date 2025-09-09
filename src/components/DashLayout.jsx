import { Outlet } from "react-router-dom";
import DashHeader from "./Dashboard/DashHeader";
import DashSidebar from "./Dashboard/DashSidebar";

const DashLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="flex-shrink-0">
        <DashHeader />
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashSidebar />
        {/* Main page content (Outlet) */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
