
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const newUser = await prisma.user.upsert({
        where: { name: 'Louis' },
        update: {},
        create: {
            name: 'Louis',
            level: 1,
            currency: 0,
            jokers: 0
        },
    });
    console.log('User created:', newUser);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
