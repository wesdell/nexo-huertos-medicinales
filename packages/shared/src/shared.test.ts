import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as enums from './enums';
import { calendarioLunar, faseLunar, recomendacionDelDia } from './lunar';
import { validarActividad, validarParticipantes, type ContextoActividad } from './actividades';
import { cicloTerminado, estadoPasos, PASOS, puedeRegistrar } from './pasos';
import {
  indiceRanking,
  misiones,
  nivelPorAvance,
  ordenarRanking,
  puntosParticipacion,
  siguienteNivel,
  talentosCertificados,
} from './gamificacion';
import { altitudValida, cedulaValida, celularValido, coordenadasEnEcuador, plantaAptaAltitud } from './validaciones';
import { huertoVirtual } from './huerto-virtual';

const ctx: ContextoActividad = {
  hoy: '2024-12-31',
  cualidad: 'FRIA',
  voluntarios: ['v1', 'v2'],
  horasDelDia: {},
};
const uno = [{ voluntarioId: 'v1', horas: 2 }];
// Fechas de referencia (fases reales): 2024-04-08 luna nueva, 2024-04-16 creciente,
// 2024-04-23 luna llena, 2024-05-01 menguante.

describe('faseLunar', () => {
  it.each([
    ['2024-04-08', 'LUNA_NUEVA'],
    ['2024-04-16', 'CRECIENTE'],
    ['2024-04-23', 'LLENA'],
    ['2024-05-01', 'MENGUANTE'],
    ['2000-01-06', 'LUNA_NUEVA'],
    ['1969-07-20', 'CRECIENTE'], // alunizaje del Apolo 11
  ])('%s -> %s', (fecha, fase) => expect(faseLunar(fecha)).toBe(fase));

  it('fuera de 1900-2100 o fecha inválida: no disponible', () => {
    expect(faseLunar('1899-12-31')).toBeNull();
    expect(faseLunar('2101-01-01')).toBeNull();
    expect(faseLunar('2024-02-30')).toBeNull();
    expect(faseLunar('08/04/2024')).toBeNull();
  });

  it('recomendación del día', () => {
    expect(recomendacionDelDia('2024-04-08')?.texto).toMatch(/preparar la tierra/);
    expect(recomendacionDelDia('x')).toBeNull();
  });

  it('calendario mensual: un día por fecha, con febrero bisiesto', () => {
    const feb = calendarioLunar(2024, 2);
    expect(feb).toHaveLength(29);
    expect(calendarioLunar(2024, 4)[7]).toEqual({ fecha: '2024-04-08', fase: 'LUNA_NUEVA' });
  });
});

describe('pasos secuenciales (reunión MSP)', () => {
  it('13 pasos en orden, empieza por la preparación', () => {
    expect(PASOS).toHaveLength(13);
    expect(estadoPasos([]).siguiente?.tipo).toBe('PREPARACION_TIERRA');
  });

  it('muestra el paso N+1 solo al registrar el N', () => {
    expect(estadoPasos(['PREPARACION_TIERRA']).siguiente?.tipo).toBe('ESTRUCTURA_SIEMBRA');
    expect(puedeRegistrar('SIEMBRA', ['PREPARACION_TIERRA'])).toBe(false);
  });

  it('cuidado y riego se repiten entre la siembra y el baño', () => {
    const hasta = ['PREPARACION_TIERRA', 'ESTRUCTURA_SIEMBRA', 'RITUAL_SIEMBRA', 'SIEMBRA', 'SENALETICA', 'CUIDADO_CRECIMIENTO', 'RIEGO'] as const;
    const e = estadoPasos([...hasta]);
    expect(e.siguiente?.tipo).toBe('BANO_PREVIO_COSECHA');
    expect(e.repetibles.map((p) => p.tipo)).toEqual(['CUIDADO_CRECIMIENTO', 'RIEGO']);
    expect(puedeRegistrar('RIEGO', [...hasta])).toBe(true);
    expect(estadoPasos([...hasta, 'BANO_PREVIO_COSECHA']).repetibles).toEqual([]);
  });

  it('el ciclo termina con el empaquetado', () => {
    expect(cicloTerminado(PASOS.map((p) => p.tipo))).toBe(true);
    expect(estadoPasos(PASOS.map((p) => p.tipo)).siguiente).toBeNull();
  });
});

describe('validarParticipantes', () => {
  it('exige al menos un voluntario del huerto', () => {
    expect(validarParticipantes([], ctx)[0].campo).toBe('participantes');
    expect(validarParticipantes([{ voluntarioId: 'x', horas: 1 }], ctx)[0].mensaje).toMatch(/activos del huerto/);
  });

  it('no más de 24 horas por día sumando lo ya registrado', () => {
    expect(validarParticipantes([{ voluntarioId: 'v1', horas: 5 }], { ...ctx, horasDelDia: { v1: 20 } })[0].mensaje).toMatch(/24 horas/);
    expect(validarParticipantes([{ voluntarioId: 'v1', horas: 4 }], { ...ctx, horasDelDia: { v1: 20 } })).toEqual([]);
  });

  it('horas positivas en medias horas y sin repetir voluntario', () => {
    expect(validarParticipantes([{ voluntarioId: 'v1', horas: 0 }], ctx)).toHaveLength(1);
    expect(validarParticipantes([{ voluntarioId: 'v1', horas: 1.3 }], ctx)).toHaveLength(1);
    expect(validarParticipantes([{ voluntarioId: 'v1', horas: 1.5 }], ctx)).toEqual([]);
    expect(validarParticipantes([...uno, ...uno], ctx)[0].mensaje).toMatch(/una sola vez/);
  });
});

describe('validarActividad', () => {
  const prep = { retiroMaleza: true, esparcido: true, remocion: true };

  it('preparación en luna nueva: sin errores ni advertencias', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', fecha: '2024-04-08', participantes: uno, detalle: prep }, ctx);
    expect(r).toEqual({ errores: [], advertencias: [], faseLunar: 'LUNA_NUEVA' });
  });

  it('preparación fuera de luna nueva: advertencia confirmable', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', fecha: '2024-04-23', participantes: uno, detalle: prep }, ctx);
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['FASE_LUNAR']);
  });

  it('preparación incompleta: errores por campo', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', participantes: uno, detalle: { retiroMaleza: true } }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['fecha', 'esparcido', 'remocion']);
  });

  it('fecha futura o anterior al paso previo: error', () => {
    expect(validarActividad({ tipo: 'LIMPIEZA', fecha: '2025-01-01', participantes: uno }, ctx).errores[0].campo).toBe('fecha');
    expect(validarActividad({ tipo: 'LIMPIEZA', fecha: '2024-04-01', participantes: uno }, { ...ctx, fechaPasoAnterior: '2024-04-05' }).errores[0].mensaje).toMatch(
      /anterior/,
    );
  });

  it('estructura antes de 15 días: aviso de fertilización', () => {
    const r = validarActividad(
      { tipo: 'ESTRUCTURA_SIEMBRA', fecha: '2024-04-16', participantes: uno, detalle: { estructura: 'SURCOS' } },
      { ...ctx, fechaPasoAnterior: '2024-04-08' },
    );
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['FERTILIZACION']);
  });

  it('ritual de siembra en luna llena al amanecer: sin advertencias; al mediodía: aviso', () => {
    expect(validarActividad({ tipo: 'RITUAL_SIEMBRA', fecha: '2024-04-23', hora: '06:00', participantes: uno }, ctx).advertencias).toEqual([]);
    const r = validarActividad({ tipo: 'RITUAL_SIEMBRA', fecha: '2024-04-23', hora: '12:00', participantes: uno }, ctx);
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['AMANECER']);
  });

  it('siembra sin técnica ni tipo y sin hora: errores', () => {
    const r = validarActividad({ tipo: 'SIEMBRA', fecha: '2024-04-23', participantes: uno }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['hora', 'tecnica', 'tipoSiembra']);
  });

  it('siembra en luna nueva a las 6: advertencias de fase y hora', () => {
    const r = validarActividad(
      { tipo: 'SIEMBRA', fecha: '2024-04-08', hora: '06:00', participantes: uno, detalle: { tecnica: 'SURCOS', tipoSiembra: 'SEMILLAS' } },
      ctx,
    );
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['FASE_LUNAR', 'HORA_SIEMBRA']);
  });

  it('señalética: color según cualidad caliente o fría', () => {
    const base = { tipo: 'SENALETICA', fecha: '2024-04-23', participantes: uno };
    const ok = { incluyeNombres: true, incluyeUsos: true };
    expect(validarActividad({ ...base, detalle: { ...ok, color: 'ROJO' } }, ctx).errores[0].mensaje).toMatch(/verde o blanco/);
    expect(validarActividad({ ...base, detalle: { ...ok, color: 'BLANCO' } }, ctx).errores).toEqual([]);
    expect(validarActividad({ ...base, detalle: { ...ok, color: 'VERDE' } }, { ...ctx, cualidad: 'CALIENTE' }).errores[0].mensaje).toMatch(/rojo/);
  });

  it('cuidado exige al menos una labor', () => {
    expect(validarActividad({ tipo: 'CUIDADO_CRECIMIENTO', fecha: '2024-04-23', participantes: uno, detalle: { labores: [] } }, ctx).errores[0].campo).toBe('labores');
  });

  it('riego con aspersor no se admite', () => {
    const r = validarActividad({ tipo: 'RIEGO', fecha: '2024-04-23', participantes: uno, detalle: { metodo: 'ASPERSOR' } }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['metodo']);
  });

  it('cosecha de raíces en luna llena antes de las 8 y sin baño a 2 días: tres advertencias', () => {
    const r = validarActividad(
      { tipo: 'COSECHA', fecha: '2024-04-23', hora: '07:00', participantes: uno, detalle: { parte: 'RAICES' } },
      { ...ctx, fechaBano: '2024-04-20' },
    );
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['FASE_LUNAR', 'ROCIO', 'BANO']);
  });

  it('secado al sol: error; 20 días: advertencia', () => {
    const base = { tipo: 'SECADO', fecha: '2024-04-23', participantes: uno };
    expect(validarActividad({ ...base, detalle: { lugar: 'SOL', dias: 12 } }, ctx).errores[0].campo).toBe('lugar');
    expect(validarActividad({ ...base, detalle: { lugar: 'COLGADO_SOMBRA', dias: 20 } }, ctx).advertencias[0].codigo).toBe('DIAS_SECADO');
  });

  it('empaquetado: etiqueta completa y caducidad máxima de 12 meses', () => {
    const base = { tipo: 'EMPAQUETADO', fecha: '2024-04-23', participantes: uno };
    const etiqueta = { cantidad: 10, indicacionesUso: 'Infusión', dosificacion: '1 taza', contraindicaciones: 'Embarazo' };
    expect(validarActividad({ ...base, detalle: { ...etiqueta, fechaCaducidad: '2025-04-23' } }, ctx).errores).toEqual([]);
    expect(validarActividad({ ...base, detalle: { ...etiqueta, fechaCaducidad: '2025-06-01' } }, ctx).errores[0].campo).toBe('fechaCaducidad');
    expect(validarActividad({ ...base, detalle: { fechaCaducidad: '2024-04-01' } }, ctx).errores.map((e) => e.campo)).toEqual([
      'cantidad',
      'indicacionesUso',
      'dosificacion',
      'contraindicaciones',
      'fechaCaducidad',
    ]);
  });

  it('tipo desconocido: error', () => {
    expect(validarActividad({ tipo: 'FUMIGACION', fecha: '2024-04-23' }, ctx).errores[0].campo).toBe('tipo');
  });
});

describe('puntos por hora (reunión MSP)', () => {
  it('10 puntos por hora, +10 % por seguir el calendario', () => {
    expect(puntosParticipacion(2, 1, false)).toBe(20);
    expect(puntosParticipacion(2, 1, true)).toBe(22);
  });
  it('segundo intento la mitad, tercero cero; paso no cumplido cero', () => {
    expect(puntosParticipacion(2, 2, false)).toBe(10);
    expect(puntosParticipacion(2, 3, false)).toBe(0);
    expect(puntosParticipacion(2, 1, true, false)).toBe(0);
  });
});

describe('niveles automáticos', () => {
  it('aprendiz, oficial y maestro según horas, tipos y ciclos', () => {
    expect(nivelPorAvance({ horas: 39, tipos: 9, ciclos: 2 })).toBe('APRENDIZ');
    expect(nivelPorAvance({ horas: 40, tipos: 4, ciclos: 0 })).toBe('OFICIAL');
    expect(nivelPorAvance({ horas: 150, tipos: 8, ciclos: 0 })).toBe('OFICIAL');
    expect(nivelPorAvance({ horas: 150, tipos: 8, ciclos: 1 })).toBe('MAESTRO');
  });
  it('nunca baja de nivel (p. ej. entró como Oficial aprobado por el MSP)', () => {
    expect(nivelPorAvance({ horas: 0, tipos: 0, ciclos: 0 }, 'OFICIAL')).toBe('OFICIAL');
  });
  it('meta del siguiente nivel', () => {
    expect(siguienteNivel({ horas: 20, tipos: 2, ciclos: 0 }, 'APRENDIZ')).toEqual({
      nivel: 'OFICIAL',
      faltan: { horas: 20, tipos: 2, ciclos: 0 },
      progreso: 67,
    });
    expect(siguienteNivel({ horas: 0, tipos: 0, ciclos: 0 }, 'MAESTRO')).toBeNull();
  });
  it('talentos con 3 participaciones aprobadas en su grupo', () => {
    expect(talentosCertificados({ SECADO: 2, EMPAQUETADO: 1, RIEGO: 2 }).map((t) => t.codigo)).toEqual(['HERBOLARIO']);
  });
});

describe('ranking normalizado', () => {
  it('índice = puntos / √(voluntarios + 1)', () => {
    expect(indiceRanking(300, 8)).toBe(100);
    expect(indiceRanking(100, 0)).toBe(100);
  });
  it('ordena por índice y desempata por quien llegó primero', () => {
    const r = ordenarRanking([
      { id: 'a', puntos: 100, voluntarios: 0, ultimoCambio: '2026-02-01' },
      { id: 'b', puntos: 300, voluntarios: 8, ultimoCambio: '2026-01-01' },
      { id: 'c', puntos: 500, voluntarios: 3, ultimoCambio: null },
    ]);
    expect(r.map((f) => [f.id, f.posicion])).toEqual([
      ['c', 1],
      ['b', 2],
      ['a', 3],
    ]);
  });
});

describe('misiones', () => {
  it('progreso limitado a la meta y cumplidas', () => {
    const m = misiones({
      siembras: 7,
      ciclosCompletos: 0,
      ciclosLunaPerfecta: 0,
      secados: 0,
      paquetes: 0,
      plantasDistintas: 2,
      voluntariosActivos: 1,
      evidenciasAprobadas: 0,
      rituales: 0,
    });
    const guardian = m.find((x) => x.codigo === 'GUARDIAN_SEMILLA')!;
    expect([guardian.actual, guardian.cumplida]).toEqual([5, true]);
    expect(m.find((x) => x.codigo === 'CICLO_COMPLETO')!.cumplida).toBe(false);
  });
});

describe('validaciones', () => {
  it('cédula ecuatoriana por módulo 10', () => {
    expect(cedulaValida('1710034065')).toBe(true);
    expect(cedulaValida('1710034066')).toBe(false);
    expect(cedulaValida('2610034065')).toBe(false); // provincia 26 no existe
    expect(cedulaValida('17100340')).toBe(false);
  });
  it('celular, coordenadas y altitud', () => {
    expect(celularValido('0991234567')).toBe(true);
    expect(celularValido('022345678')).toBe(false);
    expect(coordenadasEnEcuador(-0.22, -78.51)).toBe(true);
    expect(coordenadasEnEcuador(40.4, -3.7)).toBe(false);
    expect(altitudValida(2850)).toBe(true);
    expect(altitudValida(7000)).toBe(false);
  });
  it('planta apta por altitud', () => {
    expect(plantaAptaAltitud(2800, 2000, 3500)).toBe(true);
    expect(plantaAptaAltitud(100, 2000, 3500)).toBe(false);
    expect(plantaAptaAltitud(100, null, null)).toBe(true);
  });
});

describe('huertoVirtual', () => {
  it('sin plantas: progreso 0', () => expect(huertoVirtual([], [])).toEqual({ plantas: [], progreso: 0 }));

  it('la etapa sube con los pasos y nunca retrocede', () => {
    const r = huertoVirtual(
      ['c1'],
      [
        { tipo: 'COSECHA', plantaId: 'c1' },
        { tipo: 'RIEGO', plantaId: 'c1' },
      ],
    );
    expect(r.plantas[0].etapa.nombre).toBe('Cosechada');
  });
});

describe('enums sincronizados con schema.prisma', () => {
  const schema = readFileSync(join(__dirname, '../../../apps/backend/prisma/schema.prisma'), 'utf8');
  const valores = (nombre: string) =>
    new RegExp(`enum ${nombre} \\{([^}]*)\\}`)
      .exec(schema)![1]
      .split('\n')
      .map((l) => l.replace(/\/\/.*/, '').trim())
      .filter(Boolean);

  it.each([
    'FaseLunar',
    'TipoActividad',
    'Rol',
    'NivelMiembro',
    'Genero',
    'CicloPlanta',
    'CualidadPlanta',
    'Region',
    'TipoDiseno',
    'VarianteDiseno',
    'TipoCerca',
    'TipoSuelo',
    'TipoAgua',
    'TipoAbono',
    'EspacioBodega',
    'TipoArchivo',
    'EstadoSolicitud',
    'EstadoCiclo',
    'EstadoEvidencia',
    'CausaFracaso',
    'CategoriaAporte',
  ] as const)('%s', (nombre) => {
    expect(Object.values(enums[nombre])).toEqual(valores(nombre));
  });
});
