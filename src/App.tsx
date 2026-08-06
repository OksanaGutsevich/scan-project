//App.tsx
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { Footer } from "./components/Footer/Footer";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
