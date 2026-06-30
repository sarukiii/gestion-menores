// seed.ts — Script para poblar la base de datos con datos iniciales
//
// Un "seed" es un script que crea datos de prueba o datos esenciales
// (como el primer usuario administrador) sin tener que hacerlo a mano
// desde pgAdmin cada vez que reseteas la base de datos.
//
// Se ejecuta con: npx prisma db seed

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Ciframos la contraseña antes de guardarla — nunca en texto plano
  const passwordHash = await bcrypt.hash("Test1234", 10);

  // upsert: si el usuario ya existe lo actualiza, si no lo crea
  // Evita errores si ejecutas el seed varias veces
  const usuario = await prisma.usuario.upsert({
    where: { email: "coordinacion@test.com" },
    update: {},
    create: {
      nombre: "Usuario de Prueba",
      email: "coordinacion@test.com",
      password: passwordHash,
      rol: "COORDINACION",
      activo: true,
    },
  });

  console.log("Usuario creado:", usuario.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
