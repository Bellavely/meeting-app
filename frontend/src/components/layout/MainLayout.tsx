import { FC } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../sideBar/Sidebar";
import "./MainLayout.css";

export const MainLayout: FC = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
