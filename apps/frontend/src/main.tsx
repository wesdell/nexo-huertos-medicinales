import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import type { Rol } from '@nexo/shared';
import { Layout, LayoutPublico } from './Layout';
import { CambioClave, Login } from './pages/Acceso';
import { Usuarios } from './pages/Admin';
import { Ciclos } from './pages/Ciclos';
import { PlantasHuerto, Voluntarios } from './pages/Equipo';
import { NoEncontrada, Privacidad } from './pages/Estaticas';
import { Foro, Hilo } from './pages/Foro';
import { Bodega, DatosHuerto, Misiones, Produccion, Virtual } from './pages/Gestion';
import { Catalogo, Evidencias, Moderacion, Niveles, Registro, Solicitudes } from './pages/Msp';
import { Panel } from './pages/Panel';
import { ComoPuntos, Estadisticas, FichaHuerto, PaginaMapa, Portada, Ranking } from './pages/Publico';
import { Registrar } from './pages/Registrar';
import { PlantaDetalle, Plantas, Saberes } from './pages/Saberes';
import { Solicitar } from './pages/Solicitar';
import { ProveedorSesion, Protegida } from './sesion';
import { ProveedorToast } from './ui';
import './styles.css';

const solo = (rol: Rol, el: ReactNode) => <Protegida roles={[rol]}>{el}</Protegida>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <ProveedorToast>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/panel/clave"
              element={
                <Protegida>
                  <CambioClave />
                </Protegida>
              }
            />
            {/* Parte pública: sin iniciar sesión */}
            <Route element={<LayoutPublico />}>
              <Route index element={<Portada />} />
              <Route path="mapa" element={<PaginaMapa />} />
              <Route path="huertos/:id" element={<FichaHuerto />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="estadisticas" element={<Estadisticas />} />
              <Route path="plantas" element={<Plantas />} />
              <Route path="plantas/:id" element={<PlantaDetalle />} />
              <Route path="saberes" element={<Saberes />} />
              <Route path="foro" element={<Foro />} />
              <Route path="foro/:id" element={<Hilo />} />
              <Route path="solicitar" element={<Solicitar />} />
              <Route path="puntos" element={<ComoPuntos />} />
              <Route path="privacidad" element={<Privacidad />} />
            </Route>
            <Route
              path="/panel"
              element={
                <Protegida>
                  <Layout />
                </Protegida>
              }
            >
              <Route index element={<Panel />} />
              {/* Responsable */}
              <Route path="ciclos" element={solo('RESPONSABLE', <Ciclos />)} />
              <Route path="registrar" element={solo('RESPONSABLE', <Registrar />)} />
              <Route path="registrar/:cicloId" element={solo('RESPONSABLE', <Registrar />)} />
              <Route path="voluntarios" element={solo('RESPONSABLE', <Voluntarios />)} />
              <Route path="plantas" element={solo('RESPONSABLE', <PlantasHuerto />)} />
              <Route path="virtual" element={solo('RESPONSABLE', <Virtual />)} />
              <Route path="misiones" element={solo('RESPONSABLE', <Misiones />)} />
              <Route path="bodega" element={solo('RESPONSABLE', <Bodega />)} />
              <Route path="produccion" element={solo('RESPONSABLE', <Produccion />)} />
              <Route path="huerto" element={solo('RESPONSABLE', <DatosHuerto />)} />
              {/* Técnico del MSP */}
              <Route path="solicitudes/:estado?" element={solo('TECNICO_MSP', <Solicitudes />)} />
              <Route path="evidencias/:estado?" element={solo('TECNICO_MSP', <Evidencias />)} />
              <Route path="catalogo/:estado?" element={solo('TECNICO_MSP', <Catalogo />)} />
              <Route path="niveles" element={solo('TECNICO_MSP', <Niveles />)} />
              <Route path="registro" element={solo('TECNICO_MSP', <Registro />)} />
              <Route path="moderacion" element={solo('TECNICO_MSP', <Moderacion />)} />
              {/* Administrador del sistema */}
              <Route path="usuarios" element={solo('ADMIN', <Usuarios />)} />
            </Route>
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </ProveedorToast>
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
);
