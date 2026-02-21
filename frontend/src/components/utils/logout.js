//import {useState} from "react";
//import {useNavigate} from "react-router-dom";

export function logout(navigate) {
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
}

