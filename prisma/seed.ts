import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fastcab.com' },
        update: {
            password: hashedPassword
        },
        create: {
            email: 'admin@fastcab.com',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Admin created:', admin.email);

    // Create Vehicle Types
    const vehicles = [
        { type: 'SEDAN' as const, model: 'Swift Dzire', plateNumber: 'DL-1C-1234', capacity: 4, pricePerKm: 12 },
        { type: 'SUV' as const, model: 'Innova Crysta', plateNumber: 'MH-01-5678', capacity: 6, pricePerKm: 18 },
        { type: 'TEMPO' as const, model: 'Force Traveler', plateNumber: 'KA-05-9999', capacity: 12, pricePerKm: 25 },
    ];

    for (const v of vehicles) {
        await prisma.vehicle.upsert({
            where: { plateNumber: v.plateNumber },
            update: {},
            create: v,
        });
    }

    console.log('Initial vehicles seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
