import { Link } from 'react-router';
import { PaginaPublica } from './Acceso';

/** HU-036: política de tratamiento de datos (LOPDP Ecuador). Versión 2026-11-05. */
export function Privacidad() {
  return (
    <PaginaPublica titulo="Política de tratamiento de datos">
      <div className="space-y-4 leading-relaxed">
        <p className="text-sm text-luna-600">Versión del 05/11/2026</p>
        <p>
          Nexo trata tus datos personales conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador. Al crear tu cuenta das
          tu consentimiento libre, específico e informado para este tratamiento.
        </p>
        <h2 className="text-lg">Qué datos recogemos</h2>
        <p>Nombre, correo, fecha de nacimiento, género, la comunidad a la que perteneces y las actividades que registras en el huerto.</p>
        <h2 className="text-lg">Para qué los usamos</h2>
        <p>Para identificarte, mostrar el progreso de tu comunidad y calcular puntos. No vendemos ni cedemos tus datos a terceros.</p>
        <h2 className="text-lg">Tus derechos</h2>
        <p>
          Puedes pedir el acceso, la rectificación, la eliminación o la portabilidad de tus datos, y retirar tu consentimiento, escribiendo
          al equipo responsable del proyecto.
        </p>
        <p className="text-sm text-luna-600">Proyecto académico de la materia Calidad de Software.</p>
        <Link to="/registro" className="font-bold text-primary-700 underline decoration-2">
          Volver al registro
        </Link>
      </div>
    </PaginaPublica>
  );
}

export function NoEncontrada() {
  return (
    <PaginaPublica titulo="Página no encontrada">
      <p className="mb-4">La dirección que abriste no existe.</p>
      <Link to="/" className="font-bold text-primary-700 underline decoration-2">
        Ir al inicio
      </Link>
    </PaginaPublica>
  );
}
