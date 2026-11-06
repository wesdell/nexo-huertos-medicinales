import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './Layout';
import { ActividadNueva } from './pages/ActividadNueva';
import { ComunidadNueva } from './pages/ComunidadNueva';
import { Huerto } from './pages/Huerto';
import { HuertoVirtual } from './pages/HuertoVirtual';
import { Inicio } from './pages/Inicio';
import { Login, Registro } from './pages/Acceso';
import { NoEncontrada, Privacidad } from './pages/Estaticas';
import { ProveedorSesion, Protegida } from './sesion';
import { ProveedorToast } from './ui';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <ProveedorToast>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route
              element={
                <Protegida>
                  <Layout />
                </Protegida>
              }
            >
              <Route index element={<Inicio />} />
              <Route path="comunidad/nueva" element={<ComunidadNueva />} />
              <Route path="huerto" element={<Huerto />} />
              <Route path="huerto/virtual" element={<HuertoVirtual />} />
              <Route path="actividades/nueva" element={<ActividadNueva />} />
            </Route>
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </ProveedorToast>
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
);
