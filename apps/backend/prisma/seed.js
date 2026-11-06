// Seed idempotente: provincias, parroquias (solo cabeceras en v1) y una comunidad de demostración.
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const plantasEjemplo = require('./seed-plantas.sample.json');

const db = new PrismaClient();

// [id INEC, provincia, región, cabecera]
// ponytail: solo la parroquia cabecera de cada provincia; el catálogo DPA completo del INEC llega en v2.
const PROVINCIAS = [
  [1, 'Azuay', 'SIERRA', 'Cuenca'],
  [2, 'Bolívar', 'SIERRA', 'Guaranda'],
  [3, 'Cañar', 'SIERRA', 'Azogues'],
  [4, 'Carchi', 'SIERRA', 'Tulcán'],
  [5, 'Cotopaxi', 'SIERRA', 'Latacunga'],
  [6, 'Chimborazo', 'SIERRA', 'Riobamba'],
  [7, 'El Oro', 'COSTA', 'Machala'],
  [8, 'Esmeraldas', 'COSTA', 'Esmeraldas'],
  [9, 'Guayas', 'COSTA', 'Guayaquil'],
  [10, 'Imbabura', 'SIERRA', 'Ibarra'],
  [11, 'Loja', 'SIERRA', 'Loja'],
  [12, 'Los Ríos', 'COSTA', 'Babahoyo'],
  [13, 'Manabí', 'COSTA', 'Portoviejo'],
  [14, 'Morona Santiago', 'AMAZONIA', 'Macas'],
  [15, 'Napo', 'AMAZONIA', 'Tena'],
  [16, 'Pastaza', 'AMAZONIA', 'Puyo'],
  [17, 'Pichincha', 'SIERRA', 'Quito'],
  [18, 'Tungurahua', 'SIERRA', 'Ambato'],
  [19, 'Zamora Chinchipe', 'AMAZONIA', 'Zamora'],
  [20, 'Galápagos', 'GALAPAGOS', 'Puerto Baquerizo Moreno'],
  [21, 'Sucumbíos', 'AMAZONIA', 'Nueva Loja'],
  [22, 'Orellana', 'AMAZONIA', 'Puerto Francisco de Orellana'],
  [23, 'Santo Domingo de los Tsáchilas', 'COSTA', 'Santo Domingo'],
  [24, 'Santa Elena', 'COSTA', 'Santa Elena'],
];
const EXTRA_PICHINCHA = ['Conocoto', 'Cumbayá', 'Tumbaco', 'Calderón'];

async function main() {
  for (const [id, nombre, region, cabecera] of PROVINCIAS) {
    await db.provincia.upsert({ where: { id }, update: { nombre, region }, create: { id, nombre, region } });
    const parroquias = id === 17 ? [cabecera, ...EXTRA_PICHINCHA] : [cabecera];
    for (const [i, p] of parroquias.entries()) {
      const pid = id * 100 + i + 1; // id interno, no es el código DPA
      await db.parroquia.upsert({ where: { id: pid }, update: { nombre: p }, create: { id: pid, nombre: p, provinciaId: id } });
    }
  }

  // Cuenta de demostración (solo desarrollo). Credenciales en .env.example.
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password || (await db.usuario.findUnique({ where: { email } }))) return;

  await db.usuario.create({
    data: {
      nombre: 'Voluntaria Demo',
      email,
      passwordHash: await hash(password, 10),
      fechaNacimiento: new Date('1995-03-15T00:00:00Z'),
      genero: 'PREFIERO_NO_DECIR',
      consentimientoDatosEn: new Date(),
      versionPolitica: '2026-11-05',
      membresias: {
        create: {
          esResponsable: true,
          comunidad: {
            create: {
              nombre: 'Comunidad Demo Conocoto',
              huertos: {
                create: {
                  nombre: 'Huerto medicinal demo',
                  provinciaId: 17,
                  parroquiaId: 1702,
                  latitud: -0.29,
                  longitud: -78.48,
                  plantas: {
                    create: plantasEjemplo.map((p) => ({
                      nombreComun: p.nombreComun,
                      nombreCientifico: p.nombreCientifico,
                      otrosNombres: p.otrosNombres,
                      familiaBotanica: p.familiaBotanica,
                      provincias: p.provincias,
                      ciclo: p.ciclo,
                      cualidad: p.cualidad,
                      usosMedicinales: p.usosMedicinales.join(', '),
                    })),
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  console.log(`Cuenta demo creada: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
