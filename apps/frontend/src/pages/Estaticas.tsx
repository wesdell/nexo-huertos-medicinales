import { Link } from 'react-router';
import { PaginaPublica } from './Acceso';

/** Política de tratamiento de datos (LOPDP Ecuador). Versión 2026-11-09. */
export function Privacidad() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl">Política de tratamiento de datos</h1>
      <p className="text-sm text-luna-600">Versión del 09/11/2026</p>
      <p>
        Nexo trata los datos personales conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador. Al enviar la solicitud de huerto das tu
        consentimiento libre, específico e informado para este tratamiento.
      </p>
      <h2 className="text-xl">Qué datos recogemos</h2>
      <ul className="list-disc pl-5">
        <li>De la persona responsable: nombre, cédula, correo, celular y la ubicación del huerto.</li>
        <li>De los voluntarios (los registra el responsable con su permiso): nombre, cédula opcional, fecha de nacimiento, género y horas trabajadas.</li>
        <li>Fotos y videos de las actividades del huerto, como evidencia.</li>
      </ul>
      <h2 className="text-xl">Para qué los usamos</h2>
      <p>
        Para que el Ministerio de Salud Pública mantenga el registro de huertos, responsables y voluntarios, valide las actividades, calcule puntos y niveles y
        planifique el financiamiento. En la parte pública la ubicación del huerto se muestra aproximada (unos 1 km) y no se publican cédulas, correos ni
        celulares. No vendemos ni cedemos los datos a terceros.
      </p>
      <h2 className="text-xl">Tus derechos</h2>
      <p>
        Puedes pedir el acceso, la rectificación, la eliminación o la portabilidad de tus datos, y retirar tu consentimiento, comunicándote con el técnico del
        MSP de tu zona.
      </p>
      <p className="text-sm text-luna-600">Proyecto académico de la materia Calidad de Software (EPN).</p>
    </div>
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
