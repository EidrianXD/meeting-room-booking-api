import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROOMS = [
  { id: "1", name: "Sala Alfa" },
  { id: "2", name: "Sala Beta" },
  { id: "3", name: "Sala Gama" },
];

const USERS = [
  { id: "user-1", username: "john", password: "123456" },
  { id: "user-2", username: "mary", password: "123456" },
  { id: "user-3", username: "alice", password: "123456" },
];

async function main() {
  for (const room of ROOMS) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: { name: room.name },
      create: room,
    });
  }

  for (const user of USERS) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { password: user.password },
      create: user,
    });
  }

  console.log(`Seed concluído: ${ROOMS.length} salas e ${USERS.length} usuários.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
