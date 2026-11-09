import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router';
import { NOMBRE_DISENO, type TipoDiseno } from '@nexo/shared';

const ECUADOR: [number, number] = [-1.4, -78.4];
const OSM = { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; colaboradores de OpenStreetMap' };
export const COLOR_TIPO: Record<TipoDiseno, string> = { EN_TIERRA: '#1f7a4d', VERTICAL: '#1e3a8a', COLGANTE: '#7a3b0c', EN_PISO: '#9b1c1c' };

export interface PinHuerto {
  id: string;
  nombre: string;
  tipo: TipoDiseno;
  latitud: number;
  longitud: number;
  provincia: { nombre: string };
  voluntarios: number;
}

/** Mapa de huertos (ubicación aproximada a ~1 km por privacidad). La lista accesible va aparte, debajo del mapa. */
export function MapaHuertos({ huertos, alto = 'h-[28rem]' }: { huertos: PinHuerto[]; alto?: string }) {
  return (
    <div className={`${alto} relative z-0 overflow-hidden rounded-tarjeta shadow-tarjeta`}>
      <MapContainer center={ECUADOR} zoom={6} scrollWheelZoom={false} className="size-full" aria-label="Mapa de huertos medicinales del Ecuador">
        <TileLayer {...OSM} />
        {huertos.map((h) => (
          <CircleMarker
            key={h.id}
            center={[h.latitud, h.longitud]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 2, fillColor: COLOR_TIPO[h.tipo], fillOpacity: 0.95 }}
          >
            <Popup>
              <strong>{h.nombre}</strong>
              <br />
              {NOMBRE_DISENO[h.tipo]} · {h.provincia.nombre} · {h.voluntarios} voluntarios
              <br />
              <Link to={`/huertos/${h.id}`}>Ver huerto</Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function Clic({ onElegir }: { onElegir: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onElegir(Math.round(e.latlng.lat * 1e6) / 1e6, Math.round(e.latlng.lng * 1e6) / 1e6) });
  return null;
}

/** Georreferenciación: tocar el mapa marca el punto. Las coordenadas también se pueden escribir a mano. */
export function SelectorUbicacion({ lat, lng, onElegir }: { lat?: number; lng?: number; onElegir: (lat: number, lng: number) => void }) {
  const hay = lat !== undefined && lng !== undefined && Number.isFinite(lat) && Number.isFinite(lng);
  return (
    <div className="relative z-0 h-72 overflow-hidden rounded-2xl border-2 border-tierra-300">
      <MapContainer center={hay ? [lat, lng] : ECUADOR} zoom={hay ? 14 : 6} className="size-full" aria-label="Mapa para marcar la ubicación del huerto">
        <TileLayer {...OSM} />
        <Clic onElegir={onElegir} />
        {hay && <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1f7a4d', fillOpacity: 1 }} />}
      </MapContainer>
    </div>
  );
}
