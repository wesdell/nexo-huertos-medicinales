import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  estadoPasos,
  huertoVirtual,
  misiones,
  nivelPorAvance,
  ordenarRanking,
  PASO_POR_TIPO,
  puntosParticipacion,
  siguienteNivel,
  talentosCertificados,
  type NivelMiembro,
  type TipoActividad,
  type TipoDiseno,
} from '@nexo/shared';
import { PrismaService } from './prisma.service';

type Tx = Prisma.TransactionClient;
const UN_ANIO_MS = 365 * 86_400_000;

/** Fecha local de Ecuador (UTC−5) en formato AAAA-MM-DD. */
export const hoyEcuador = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
export const aFecha = (s: string) => new Date(`${s}T00:00:00Z`);
export const deFecha = (d: Date) => d.toISOString().slice(0, 10);

/** Puntos, niveles, ranking, misiones y huerto virtual: lo que se calcula a partir de las actividades. */
@Injectable()
export class GamificacionService {
  constructor(private readonly db: PrismaService) {}

  /**
   * El MSP aprobó la evidencia: acredita los puntos a cada voluntario (horas × 10, bono, factor de intento),
   * actualiza los cachés y sube de nivel si corresponde. Debe ir dentro de una transacción.
   */
  async acreditar(tx: Tx, actividadId: string) {
    const a = await tx.actividad.findUniqueOrThrow({ where: { id: actividadId }, include: { participaciones: true } });
    let total = 0;
    for (const p of a.participaciones) {
      const horas = Number(p.horas);
      const puntos = puntosParticipacion(horas, a.intento, a.advertencias.length === 0, a.cumplida);
      total += puntos;
      await tx.movimientoPuntos.create({ data: { voluntarioId: p.voluntarioId, huertoId: a.huertoId, actividadId, puntos, horas } });
      await tx.voluntario.update({ where: { id: p.voluntarioId }, data: { puntos: { increment: puntos }, horasValidadas: { increment: horas } } });
      await this.actualizarNivel(tx, p.voluntarioId);
    }
    await tx.actividad.update({ where: { id: actividadId }, data: { puntosOtorgados: total } });
    if (total > 0) await tx.huerto.update({ where: { id: a.huertoId }, data: { puntosTotales: { increment: total }, ultimoCambioPuntos: new Date() } });
    return total;
  }

  async avance(tx: Tx, voluntarioId: string) {
    const aprobadas = await tx.participacion.findMany({
      where: { voluntarioId, actividad: { estadoEvidencia: 'APROBADA', cumplida: true } },
      select: { horas: true, actividad: { select: { tipo: true, cicloId: true, ciclo: { select: { estado: true } } } } },
    });
    const porTipo: Partial<Record<TipoActividad, number>> = {};
    for (const p of aprobadas) porTipo[p.actividad.tipo] = (porTipo[p.actividad.tipo] ?? 0) + 1;
    return {
      avance: {
        horas: aprobadas.reduce((s, p) => s + Number(p.horas), 0),
        tipos: Object.keys(porTipo).length,
        ciclos: new Set(aprobadas.filter((p) => p.actividad.ciclo.estado === 'COMPLETADO').map((p) => p.actividad.cicloId)).size,
      },
      porTipo,
    };
  }

  private async actualizarNivel(tx: Tx, voluntarioId: string) {
    const v = await tx.voluntario.findUniqueOrThrow({ where: { id: voluntarioId }, select: { nivel: true } });
    const { avance } = await this.avance(tx, voluntarioId);
    const nivel = nivelPorAvance(avance, v.nivel);
    if (nivel !== v.nivel) await tx.voluntario.update({ where: { id: voluntarioId }, data: { nivel } });
  }

  /** Ficha de gamificación de un voluntario: nivel, meta siguiente y talentos certificados. */
  async perfilVoluntario(voluntarioId: string, nivel: NivelMiembro) {
    const { avance, porTipo } = await this.avance(this.db, voluntarioId);
    return { avance, siguiente: siguienteNivel(avance, nivel), talentos: talentosCertificados(porTipo).map((t) => t.nombre) };
  }

  /** Ranking por tipo de huerto: puntos de los últimos 12 meses ÷ √(voluntarios activos + 1). */
  async ranking(tipo?: TipoDiseno) {
    const huertos = await this.db.huerto.findMany({
      where: { activo: true, ...(tipo ? { tipo } : {}) },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        ultimoCambioPuntos: true,
        provincia: { select: { nombre: true } },
        _count: { select: { voluntarios: { where: { activo: true } } } },
      },
    });
    const puntos = await this.db.movimientoPuntos.groupBy({
      by: ['huertoId'],
      where: { creadoEn: { gte: new Date(Date.now() - UN_ANIO_MS) } },
      _sum: { puntos: true },
    });
    const porHuerto = new Map(puntos.map((p) => [p.huertoId, p._sum.puntos ?? 0]));
    return ordenarRanking(
      huertos.map((h) => ({
        id: h.id,
        nombre: h.nombre,
        tipo: h.tipo,
        provincia: h.provincia.nombre,
        puntos: porHuerto.get(h.id) ?? 0,
        voluntarios: h._count.voluntarios,
        ultimoCambio: h.ultimoCambioPuntos?.toISOString() ?? null,
      })),
    );
  }

  /** Ranking de producción del año (paquetes con evidencia aprobada): base del financiamiento. */
  async rankingProduccion(anio = new Date().getUTCFullYear()) {
    const paquetes = await this.db.paquete.findMany({
      where: {
        fechaEmpaquetado: { gte: aFecha(`${anio}-01-01`), lte: aFecha(`${anio}-12-31`) },
        actividad: { estadoEvidencia: 'APROBADA' },
      },
      select: { cantidad: true, actividad: { select: { huerto: { select: { id: true, nombre: true, tipo: true } } } } },
    });
    const suma = new Map<string, { id: string; nombre: string; tipo: string; paquetes: number }>();
    for (const p of paquetes) {
      const h = p.actividad.huerto;
      const fila = suma.get(h.id) ?? { ...h, paquetes: 0 };
      fila.paquetes += p.cantidad;
      suma.set(h.id, fila);
    }
    return [...suma.values()].sort((a, b) => b.paquetes - a.paquetes).map((f, i) => ({ ...f, posicion: i + 1 }));
  }

  /** Misiones e insignias del huerto (calculadas, no se guardan). */
  async misiones(huertoId: string) {
    const [acts, ciclos, plantas, voluntarios, paquetes] = await Promise.all([
      this.db.actividad.findMany({ where: { huertoId, cumplida: true }, select: { tipo: true, estadoEvidencia: true } }),
      this.db.ciclo.findMany({
        where: { huertoId, estado: 'COMPLETADO' },
        select: { actividades: { select: { tipo: true, advertencias: true, cumplida: true } } },
      }),
      this.db.huertoPlanta.count({ where: { huertoId } }),
      this.db.voluntarioHuerto.count({ where: { huertoId, activo: true } }),
      this.db.paquete.aggregate({ where: { actividad: { huertoId, estadoEvidencia: 'APROBADA' } }, _sum: { cantidad: true } }),
    ]);
    const cuenta = (t: TipoActividad) => acts.filter((a) => a.tipo === t).length;
    const lunaPerfecta = ciclos.filter((c) =>
      c.actividades.every((a) => a.cumplida && (!PASO_POR_TIPO[a.tipo].fases || !a.advertencias.includes('FASE_LUNAR'))),
    ).length;
    return misiones({
      siembras: cuenta('SIEMBRA'),
      ciclosCompletos: ciclos.filter((c) => c.actividades.some((a) => a.tipo === 'EMPAQUETADO' && a.cumplida)).length,
      ciclosLunaPerfecta: lunaPerfecta,
      secados: cuenta('SECADO'),
      paquetes: paquetes._sum.cantidad ?? 0,
      plantasDistintas: plantas,
      voluntariosActivos: voluntarios,
      evidenciasAprobadas: acts.filter((a) => a.estadoEvidencia === 'APROBADA').length,
      rituales: cuenta('RITUAL_SIEMBRA') + cuenta('RITUAL_GRATITUD'),
    });
  }

  /** Espejo digital: etapa de cada ciclo activo (o del último) y avance del huerto. */
  async espejo(huertoId: string) {
    const ciclos = await this.db.ciclo.findMany({
      where: { huertoId, estado: { in: ['ACTIVO', 'COMPLETADO'] } },
      orderBy: { iniciadoEn: 'desc' },
      select: {
        id: true,
        estado: true,
        planta: { select: { id: true, nombreComun: true, cualidad: true } },
        actividades: { select: { tipo: true, cumplida: true } },
      },
    });
    // Un ciclo por planta: el más reciente.
    const vistos = new Set<string>();
    const recientes = ciclos.filter((c) => !vistos.has(c.planta.id) && vistos.add(c.planta.id));
    const v = huertoVirtual(
      recientes.map((c) => c.id),
      recientes.flatMap((c) => c.actividades.filter((a) => a.cumplida).map((a) => ({ tipo: a.tipo, plantaId: c.id }))),
    );
    return {
      progreso: v.progreso,
      plantas: v.plantas.map((r, i) => ({
        cicloId: r.plantaId,
        planta: recientes[i].planta,
        estado: recientes[i].estado,
        etapa: r.etapa,
        siguiente: estadoPasos(recientes[i].actividades.map((a) => a.tipo)).siguiente?.nombre ?? null,
      })),
    };
  }
}
