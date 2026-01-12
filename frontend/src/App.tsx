import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StartSession from "./pages/StartSession";
import Lesson from "./pages/Lesson";
import Complete from "./pages/Complete";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<StartSession />} />
        <Route path="/lesson" element={<Lesson />} />
        <Route path="/complete" element={<Complete />} />
      </Routes>
    </BrowserRouter>
  );
}
