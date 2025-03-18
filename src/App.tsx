import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SharedWishlist from "./pages/SharedWishlist";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthProvider";
import SharedWithMe from "./components/ui/SharedWithMe";

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

      <Route path="/shared/:shareCode" element={<SharedWishlist />} />
      <Route path="/shared-with-me" element={<PrivateRoute><SharedWithMe /></PrivateRoute>} />

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
