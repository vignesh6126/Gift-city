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
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Add this import

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Only public route */}
        <Route path="/login" element={<Login />} />

        {/* ✅ All protected routes */}
        <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboardlight" element={<ProtectedRoute><Dashboardlight /></ProtectedRoute>} />
        <Route path="/invested"      element={<ProtectedRoute><Invested /></ProtectedRoute>} />
        <Route path="/interested"    element={<ProtectedRoute><Interested /></ProtectedRoute>} />
        <Route path="/empanelment"   element={<ProtectedRoute><Empanelment /></ProtectedRoute>} />
        <Route path="/gift-city-ac"  element={<ProtectedRoute><GiftCityAC /></ProtectedRoute>} />
        <Route path="/customers"     element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/products"      element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/amc-table"     element={<ProtectedRoute><AMCTable /></ProtectedRoute>} />

        {/* ✅ Any unknown URL → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;