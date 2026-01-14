import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = ['Lucas', 'Nicolas']

    for (const name of users) {
        await prisma.user.upsert({
            where: { name },
            update: {},
            create: { name, level: 1 },
        })
    }

    console.log('Users seeded!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
