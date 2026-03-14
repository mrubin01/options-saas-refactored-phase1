import { Routes, Route, Navigate } from "react-router-dom";
import CoveredCallsPage from "./pages/CoveredCallsPage";
import PutOptionsPage from "./pages/PutOptionsPage";
import SpreadOptionsPage from "./pages/SpreadOptionsPage";
import LoginPage from "./pages/LoginPage";
import Navigation from "./components/Navigation";
import { RequireAuth } from "./auth/RequireAuth";
import Layout from "./components/Layout";

function App() {
  return (
    <>
      <Navigation />

      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/covered-calls" />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/covered-calls"
            element={
              <RequireAuth>
                <CoveredCallsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/put-options"
            element={
              <RequireAuth>
                <PutOptionsPage />
              </RequireAuth>
            }
          />

          <Route
            path="/spread-options"
            element={
              <RequireAuth>
                <SpreadOptionsPage />
              </RequireAuth>
            }
          />
        </Routes>
      </Layout>
    </>
  );
}

export default App;

