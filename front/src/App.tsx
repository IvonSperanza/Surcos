import { BrowserRouter, Route, Routes } from "react-router-dom";

// Cada pantalla vive en src/features/<nombre>/ y se registra acá.
// Rutas previstas: ver "Pantallas y rutas" en AGENTS.md.
function Inicio() {
    return (
        <main style={{ padding: "var(--space-8)" }}>
            <h1 className="display">Surco</h1>
            <p className="body">Del satélite a tu mesa.</p>
        </main>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Inicio />} />
            </Routes>
        </BrowserRouter>
    );
}
