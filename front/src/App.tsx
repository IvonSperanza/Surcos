import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "./features/landing/LandingPage";
import { ParcelaPage } from "./features/parcela/ParcelaPage";
import { ProductorApp } from "./features/productor/ProductorApp";
import { RUTA_PANEL } from "./features/productor/rutas";

// Cada pantalla vive en src/features/<nombre>/ y se registra acá.
// Rutas previstas: ver "Pantallas y rutas" en AGENTS.md.
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/parcela" element={<ParcelaPage />} />
                <Route path={`${RUTA_PANEL}/*`} element={<ProductorApp />} />
            </Routes>
        </BrowserRouter>
    );
}
