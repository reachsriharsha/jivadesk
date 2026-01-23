// Main App component for JivaDesk
import React from "react";
import Register from "./pages/Register";

function App() {
  // Simple routing based on path
  const path = window.location.pathname;

  if (path === "/register") {
    return <Register />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">JivaDesk</h1>
        <p className="text-gray-600 mb-8">Doctor Practice Management System</p>
        <div className="space-x-4">
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
