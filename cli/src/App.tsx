import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Login.tsx";
import Home from "./pages/Home/Home.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Login />} />
        </Routes>
    );
}

export default App;
