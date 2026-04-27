import React from "react";
import { Navigate } from "react-router-dom";
import   NotAuthorised from "../../pages/NotAuthorised";

export default function ProtectedRoutes({ allowedRoles = [], children }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) return <Navigate to="/" replace />;
    if (!role || !allowedRoles.includes(role)) return <NotAuthorised />;

    return children;
}