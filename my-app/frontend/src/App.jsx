import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Invested from "./pages/Invested";
import Interested from "./pages/Interested";
import Empanelment from "./pages/Empanelment";
import GiftCityAC from "./pages/GiftCity";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import AMCTable from "./pages/AMCTable";
import Dashboardlight from "./pages/Dashboardlight";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login"      element={<Login />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/dashboardlight"  element={<Dashboardlight />} />
        <Route path="/invested"   element={<Invested />} />
        <Route path="/interested" element={<Interested />} />
        <Route path="/empanelment" element={<Empanelment />} />
        <Route path="/gift-city-ac" element={<GiftCityAC />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/amc-table" element={<AMCTable />} />
        <Route path="/"           element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;