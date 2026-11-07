import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as enums from './enums';
import { faseLunar, recomendacionDelDia } from './lunar';
import { puntosPorActividad, validarActividad, type ContextoActividad } from './actividades';
import { huertoVirtual } from './huerto-virtual';

const ctx: ContextoActividad = { plantasDelHuerto: ['p1', 'p2'], plantasSembradas: ['p1'], hoy: '2024-12-31' };
// Fechas de referencia (fases reales): 2024-04-08 luna nueva, 2024-04-23 luna llena,
// 2024-04-16 creciente, 2024-05-01 menguante.

describe('faseLunar (HU-017)', () => {
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
});

describe('validarActividad', () => {
  const prep = { retiroMaleza: true, esparcido: true, remocion: true };

  it('preparación en luna nueva: sin errores ni advertencias (HU-018)', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', fecha: '2024-04-08', detalle: prep }, ctx);
    expect(r).toEqual({ errores: [], advertencias: [], faseLunar: 'LUNA_NUEVA' });
  });

  it('preparación fuera de luna nueva: advertencia confirmable', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', fecha: '2024-04-23', detalle: prep }, ctx);
    expect(r.errores).toEqual([]);
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['FASE_LUNAR']);
  });

  it('preparación incompleta: errores por campo', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', detalle: { retiroMaleza: true } }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['fecha', 'esparcido', 'remocion']);
  });

  it('fecha futura: error', () => {
    const r = validarActividad({ tipo: 'PREPARACION_TIERRA', fecha: '2025-01-01', detalle: prep }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['fecha']);
  });

  it('siembra de planta no registrada: error (HU-021)', () => {
    const r = validarActividad(
      { tipo: 'SIEMBRA', fecha: '2024-04-23', hora: '08:30', plantaId: 'otra', detalle: { tecnica: 'SURCOS', tipoSiembra: 'SEMILLAS' } },
      ctx,
    );
    expect(r.errores.map((e) => e.campo)).toEqual(['plantaId']);
  });

  it('siembra sin técnica ni tipo: errores', () => {
    const r = validarActividad({ tipo: 'SIEMBRA', fecha: '2024-04-23', hora: '08:30', plantaId: 'p2' }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['tecnica', 'tipoSiembra']);
  });

  it('riego con aspersor no se admite y exige siembra previa (HU-023)', () => {
    const sinSiembra = { ...ctx, plantasSembradas: [] };
    const r = validarActividad({ tipo: 'RIEGO', fecha: '2024-04-23', detalle: { metodo: 'ASPERSOR' } }, sinSiembra);
    expect(r.errores.map((e) => e.campo)).toEqual(['metodo', 'plantaId']);
  });

  it('cosecha de raíces en luna llena antes de las 8: dos advertencias (HU-025)', () => {
    const r = validarActividad({ tipo: 'COSECHA', fecha: '2024-04-23', hora: '07:00', plantaId: 'p1', detalle: { parte: 'RAICES' } }, ctx);
    expect(r.errores).toEqual([]);
    expect(r.advertencias.map((a) => a.codigo)).toEqual(['FASE_LUNAR', 'ROCIO']);
  });

  it('cosecha de planta sin siembra: error', () => {
    const r = validarActividad({ tipo: 'COSECHA', fecha: '2024-04-23', hora: '09:00', plantaId: 'p2', detalle: { parte: 'HOJAS' } }, ctx);
    expect(r.errores.map((e) => e.campo)).toEqual(['plantaId']);
  });

  it('tipo no habilitado en v1: error', () => {
    expect(validarActividad({ tipo: 'SECADO', fecha: '2024-04-23' }, ctx).errores[0].campo).toBe('tipo');
  });
});

describe('puntosPorActividad (HU-030)', () => {
  it('base + bono, sin bono con advertencias, cero si se repite', () => {
    expect(puntosPorActividad('SIEMBRA', false, false)).toEqual({ base: 15, bono: 5 });
    expect(puntosPorActividad('SIEMBRA', true, false)).toEqual({ base: 15, bono: 0 });
    expect(puntosPorActividad('RIEGO', false, true)).toEqual({ base: 0, bono: 0 });
  });
});

describe('huertoVirtual (HU-016)', () => {
  it('sin plantas: progreso 0', () => expect(huertoVirtual([], [])).toEqual({ plantas: [], progreso: 0 }));

  it('sin actividades: estado inicial', () => {
    expect(huertoVirtual(['a'], []).plantas[0].etapa.nivel).toBe(0);
  });

  it('preparación lleva todas a etapa 1; riego general solo avanza sembradas', () => {
    const r = huertoVirtual(
      ['a', 'b'],
      [
        { tipo: 'RIEGO', plantaId: null },
        { tipo: 'PREPARACION_TIERRA', plantaId: null },
        { tipo: 'SIEMBRA', plantaId: 'a' },
      ],
    );
    expect(r.plantas.map((p) => p.etapa.nivel)).toEqual([3, 1]);
    expect(r.progreso).toBe(33); // (3 + 1) / 12
  });

  it('la etapa nunca retrocede', () => {
    const r = huertoVirtual(
      ['a'],
      [
        { tipo: 'COSECHA', plantaId: 'a' },
        { tipo: 'RIEGO', plantaId: 'a' },
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

  it.each(['FaseLunar', 'TipoActividad', 'Genero', 'CicloPlanta', 'CualidadPlanta', 'Region'] as const)('%s', (nombre) => {
    expect(Object.values(enums[nombre])).toEqual(valores(nombre));
  });
});
