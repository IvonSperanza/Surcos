import { useEffect } from "react";
import { AttributionControl, MapContainer, Polygon, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { Parcela } from "../../api/parcelas";
import { anilloLeaflet, limites } from "../../lib/geometria";
import { colorToken } from "../../lib/tokens";
import { estadoGeneral, useDatosParcela } from "./almacenDatos";
import { DetalleEnMapa } from "./DetalleEnMapa";
import styles from "./parcelas.module.css";

// Cinturón hortícola de Rosario, al sudeste de Soldini.
const CENTRO_SIN_PARCELAS: LatLngTuple = [-33.0265, -60.7325];

function EncuadrarParcelas({ parcelas }: { parcelas: Parcela[] }) {
    const mapa = useMap();
    useEffect(() => {
        const encuadre = limites(parcelas.map((p) => p.geometria));
        if (encuadre) mapa.fitBounds(encuadre, { padding: [40, 40], maxZoom: 17 });
    }, [mapa, parcelas]);
    return null;
}

// Verde cuando la parcela ya tiene sus datos, sol mientras se generan.
function PoligonoParcela({ parcela, onAbrir }: { parcela: Parcela; onAbrir?: (id: string) => void }) {
    const estado = estadoGeneral(useDatosParcela(parcela.id));
    const color = colorToken(estado === "generando" ? "sol" : "hoja");
    return (
        <Polygon
            positions={anilloLeaflet(parcela.geometria)}
            pathOptions={{ color, weight: 2, fillColor: color, fillOpacity: 0.25 }}
        >
            <Tooltip sticky>{parcela.nombre}</Tooltip>
            {/* Un clic muestra el detalle sin salir del mapa; la ficha, desde ahí. */}
            {onAbrir && (
                <Popup minWidth={240} maxWidth={300}>
                    <DetalleEnMapa parcela={parcela} onAbrir={() => onAbrir(parcela.id)} />
                </Popup>
            )}
        </Polygon>
    );
}

export function MapaParcelas({ parcelas, onAbrir, compacto = false }: { parcelas: Parcela[]; onAbrir?: (id: string) => void; compacto?: boolean }) {
    return (
        <MapContainer center={CENTRO_SIN_PARCELAS} zoom={15} maxZoom={19} attributionControl={false} className={compacto ? styles.mapaCompacto : styles.mapa}>
            {/* Esri exige su atribución sobre el mapa; el prefijo de Leaflet no. */}
            <AttributionControl prefix={false} />
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri, Maxar, Earthstar Geographics"
                maxZoom={19}
            />
            <EncuadrarParcelas parcelas={parcelas} />
            {parcelas.map((p) => (
                <PoligonoParcela key={p.id} parcela={p} onAbrir={onAbrir} />
            ))}
        </MapContainer>
    );
}
