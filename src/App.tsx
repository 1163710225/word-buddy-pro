import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WordBooks from "./pages/WordBooks";
import Study from "./pages/Study";
import Review from "./pages/Review";
import Plan from "./pages/Plan";
import Stats from "./pages/Stats";
import AI from "./pages/AI";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wordbooks" element={<WordBooks />} />
          <Route path="/study" element={<Study />} />
          <Route path="/review" element={<Review />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
