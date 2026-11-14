import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type { Coordenada } from "../../api/ndvi";
import { colorToken } from "../../lib/tokens";
import styles from "./parcela.module.css";

// Cinturón hortícola de Rosario, al sudeste de Soldini.
const CENTRO_INICIAL: LatLngTuple = [-33.0265, -60.7325];

type Props = {
    vertices: Coordenada[];
    cerrada: boolean;
    onAgregarVertice: (vertice: Coordenada) => void;
    onCerrar: () => void;
};

function CapturaDeClics({ onClic }: { onClic: (vertice: Coordenada) => void }) {
    useMapEvents({ click: (e) => onClic([e.latlng.lng, e.latlng.lat]) });
    return null;
}

// GeoJSON guarda [lon, lat]; Leaflet dibuja [lat, lon].
const aLeaflet = ([lon, lat]: Coordenada): LatLngTuple => [lat, lon];

export function MapaParcela({ vertices, cerrada, onAgregarVertice, onCerrar }: Props) {
    const puntos = vertices.map(aLeaflet);
    const trazo = { color: colorToken(cerrada ? "cielo" : "trigo"), weight: 2 };

    return (
        <MapContainer center={CENTRO_INICIAL} zoom={17} maxZoom={19} doubleClickZoom={false} className={styles.mapa}>
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Imágenes: Esri, Maxar, Earthstar Geographics"
                maxZoom={19}
            />
            <CapturaDeClics onClic={onAgregarVertice} />

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
                        pathOptions={{ color: colorToken("trigo"), fillColor: colorToken("surface-raised"), fillOpacity: 1, weight: 2 }}
                        // Sin esto, el clic en un vértice también llega al mapa y agrega otro.
                        bubblingMouseEvents={false}
                        eventHandlers={i === 0 ? { click: onCerrar } : undefined}
                    />
                ))}
        </MapContainer>
    );
}
