import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Login.tsx";
import Register from "./pages/Auth/Register.tsx";
import ReceivedBookings from "./pages/Bookings/ReceivedBookings.tsx";
import MyBookings from "./pages/Bookings/MyBookings.tsx";
import AccessDenied from "./pages/Errors/AccessDenied.tsx";
import NotFound from "./pages/Errors/NotFound.tsx";
import Home from "./pages/Home/Home.tsx";
import MentionsLegales from "./pages/Legal/MentionsLegales.tsx";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import Shop from "./pages/Shop/Shop.tsx";
import MyWorkstations from "./pages/Workstations/MyWorkstations.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route
                path="/politique-de-confidentialite"
                element={<PrivacyPolicy />}
            />
            <Route path="/acces-interdit" element={<AccessDenied />} />
            <Route path="/mon-compte" element={<Profile />} />
            <Route path="/tatoueur/demandes" element={<MyBookings />} />
            <Route path="/gerant/demandes" element={<ReceivedBookings />} />
            <Route path="/gerant/salon" element={<Shop />} />
            <Route path="/gerant/postes" element={<MyWorkstations />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
