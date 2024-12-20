import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./App";
import Dashboard from "./dashboard/Dashboard";
import Register from "./Register";
import "./index.css";

const root = ReactDOM.createRoot( document.getElementById( "root" ) );
root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/dashboard" element={<Dashboard />} />
		</Routes>
	</BrowserRouter>
);
