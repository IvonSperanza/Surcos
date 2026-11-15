import { AttributionControl, CircleMarker, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { Coordenada, PoligonoGeoJson } from "../../api/ndvi";
import { anilloLeaflet, limites } from "../../lib/geometria";
import { colorToken } from "../../lib/tokens";
import styles from "./parcela.module.css";

// Cinturón hortícola de Rosario, al sudeste de Soldini.
const CENTRO_INICIAL: LatLngTuple = [-33.0265, -60.7325];

type Props = {
    vertices: Coordenada[];
    cerrada: boolean;
    onAgregarVertice: (vertice: Coordenada) => void;
    onCerrar: () => void;
    // Parcelas ya cargadas: se ven de fondo para no dibujar encima.
    otras?: PoligonoGeoJson[];
};

function CapturaDeClics({ onClic }: { onClic: (vertice: Coordenada) => void }) {
    useMapEvents({ click: (e) => onClic([e.latlng.lng, e.latlng.lat]) });
    return null;
}

// GeoJSON guarda [lon, lat]; Leaflet dibuja [lat, lon].
const aLeaflet = ([lon, lat]: Coordenada): LatLngTuple => [lat, lon];

export function MapaParcela({ vertices, cerrada, onAgregarVertice, onCerrar, otras = [] }: Props) {
    const puntos = vertices.map(aLeaflet);
    const trazo = { color: colorToken(cerrada ? "cielo" : "sol"), weight: 2 };
    // Con parcelas cargadas el mapa arranca encuadrándolas; si no, en el cinturón hortícola.
    const encuadre = limites(otras);
    const vista = encuadre ? { bounds: encuadre, boundsOptions: { padding: [40, 40] as [number, number], maxZoom: 17 } } : { center: CENTRO_INICIAL, zoom: 17 };

    return (
        <MapContainer {...vista} maxZoom={19} doubleClickZoom={false} attributionControl={false} className={styles.mapa}>
            {/* Esri exige su atribución sobre el mapa; el prefijo de Leaflet no. */}
            <AttributionControl prefix={false} />
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Esri, Maxar, Earthstar Geographics"
                maxZoom={19}
            />
            <CapturaDeClics onClic={onAgregarVertice} />

            {otras.map((g, i) => (
                <Polygon
                    key={i}
                    positions={anilloLeaflet(g)}
                    // No interactivas: un clic sobre ellas tiene que seguir agregando vértices.
                    interactive={false}
                    pathOptions={{ color: colorToken("surface-raised"), weight: 1.5, dashArray: "4 6", fillColor: colorToken("surface-raised"), fillOpacity: 0.15 }}
                />
            ))}

            {cerrada ? (
                <Polygon positions={puntos} pathOptions={{ ...trazo, fillColor: colorToken("cielo"), fillOpacity: 0.2 }} />
            ) : (
                <Polyline positions={puntos} pathOptions={{ ...trazo, dashArray: "6 6" }} />
            )}

            {!cerrada &&
                puntos.map((punto, i) => (
                    <CircleMarker
                        key={`${punto[0]}-${punto[1]}`}
                        center={punto}
                        radius={i === 0 ? 7 : 4}
                        pathOptions={{ color: colorToken("sol"), fillColor: colorToken("surface-raised"), fillOpacity: 1, weight: 2 }}
                        // Sin esto, el clic en un vértice también llega al mapa y agrega otro.
                        bubblingMouseEvents={false}
                        eventHandlers={i === 0 ? { click: onCerrar } : undefined}
                    />
                ))}
        </MapContainer>
    );
}
