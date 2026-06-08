import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Header from "@/components/Header";
import AppRoutes from "@/routes/AppRoutes";
import type { RootState } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/redux/store";
import { Toaster } from "./components/ui/toaster";

function App() {
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
   const isAuthenticated = useSelector((state: RootState) => state.auth.authorizationToken);

 useEffect(() => {
  document.documentElement.setAttribute(
    "data-theme",
    darkMode ? "dark" : "light"
  )
}, [darkMode])

  return (
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <main className="flex-1 bg-background text-foreground">
          <AppRoutes />
        </main>
         <Toaster />
      </BrowserRouter>
    </PersistGate>
  );
}

export default App;
