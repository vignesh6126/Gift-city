import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Invested from "./pages/Invested"; // ✅ Add this
import Interested from "./pages/Interested";
import Empanelment from "./pages/Empanelment";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invested" element={<Invested />} /> 
        <Route path="/interested" element={<Interested />} />
        <Route path="/empanelment" element={<Empanelment />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;