import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Routes (Require Authentication) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
