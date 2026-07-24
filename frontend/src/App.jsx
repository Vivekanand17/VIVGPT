import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";

import Home from "./pages/Home";
import Chat from "./pages/Chat";

const CLERK_PUBLISHABLE_KEY = "pk_live_YWN0dWFsLXNhdHlyLTU5LmNsZXJrLmFjY291bnRzLmRldiQ";

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

