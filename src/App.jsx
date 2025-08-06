import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./shared/contexts/AuthContext";
import Dashboard from "./platforms/web/pages/Dashboard";
import Login from "./platforms/web/pages/Login";

import { useEffect, useState } from "react";
import CustomAlert from "./platforms/web/components/common/CustomAlert";
import { setAlertCallback } from "./core/utils/alertUtils";

function App() {
  const [alertMsg, setAlertMsg] = useState("");

  // Register the custom alert callback on mount
  useEffect(() => {
    setAlertCallback(setAlertMsg);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>

      {/* Global Custom Alert */}
      <CustomAlert message={alertMsg} onClose={() => setAlertMsg("")} />
    </AuthProvider>
  );
}

export default App;
