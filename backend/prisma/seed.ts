import {
  PrismaClient,
  UserRole,
  KycStatus,
  VehicleType,
  FuelType,
  Transmission,
  VehicleStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with structured users, KYC documents, and vehicle listings...');

  const defaultPassword = await bcrypt.hash('Password@123', 12);
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  // 1. Create / Upsert Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wheelswap.in' },
    update: {},
    create: {
      email: 'admin@wheelswap.in',
      name: 'WheelSwap Admin',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isKycVerified: true,
      isActive: true,
      city: 'Delhi',
      state: 'Delhi',
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // ── CATEGORY 1: 5 Fully Approved Users, KYC & Active Vehicles ──
  console.log('\n📦 Seeding Category 1: 5 Approved Users & Vehicles (Delhi, Noida, Agra)...');

  const cat1Data = [
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@wheelswap.in',
      phone: '9811000001',
      city: 'Delhi',
      state: 'Delhi',
      aadhaar: '100020003001',
      license: 'DL-0120220001001',
      vehicle: {
        brand: 'Hyundai',
        model: 'Creta',
        year: 2022,
        vehicleType: VehicleType.SUV,
        fuelType: FuelType.PETROL,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 5,
        color: 'White',
        licensePlate: 'DL01AB1001',
        registrationNumber: 'RC-DL01-1001',
        description: 'Spacious and well-maintained Hyundai Creta SX. Perfect for weekend road trips from Delhi.',
        features: ['Sunroof', 'GPS Navigation', 'Touchscreen Infotainment', 'Ventilated Seats', 'Rear Camera'],
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      name: 'Amit Sharma',
      email: 'amit.sharma@wheelswap.in',
      phone: '9811000002',
      city: 'Agra',
      state: 'Uttar Pradesh',
      aadhaar: '100020003002',
      license: 'UP-8020210002002',
      vehicle: {
        brand: 'Honda',
        model: 'City',
        year: 2021,
        vehicleType: VehicleType.SEDAN,
        fuelType: FuelType.PETROL,
        transmission: Transmission.MANUAL,
        numberOfSeats: 5,
        color: 'Silver',
        licensePlate: 'UP80BC2002',
        registrationNumber: 'RC-UP80-2002',
        description: 'Smooth driving Honda City V variant with premium leather seats and great highway mileage.',
        features: ['Bluetooth Audio', 'Cruise Control', 'Alloy Wheels', 'Automatic Climate Control'],
        imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      name: 'Pooja Gupta',
      email: 'pooja.gupta@wheelswap.in',
      phone: '9811000003',
      city: 'Noida',
      state: 'Uttar Pradesh',
      aadhaar: '100020003003',
      license: 'UP-1620230003003',
      vehicle: {
        brand: 'Tata',
        model: 'Nexon EV',
        year: 2023,
        vehicleType: VehicleType.SUV,
        fuelType: FuelType.ELECTRIC,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 5,
        color: 'Teal Blue',
        licensePlate: 'UP16CD3003',
        registrationNumber: 'RC-UP16-3003',
        description: 'Eco-friendly Tata Nexon EV Max. 300+ km real range with fast charging cable included.',
        features: ['Fast Charging', 'Digital Cockpit', 'Harman Sound System', 'Drive Modes'],
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      name: 'Saurabh Kumar',
      email: 'saurabh.kumar@wheelswap.in',
      phone: '9811000004',
      city: 'Noida',
      state: 'Uttar Pradesh',
      aadhaar: '100020003004',
      license: 'UP-1620200004004',
      vehicle: {
        brand: 'Maruti Suzuki',
        model: 'Swift ZXi',
        year: 2020,
        vehicleType: VehicleType.HATCHBACK,
        fuelType: FuelType.PETROL,
        transmission: Transmission.MANUAL,
        numberOfSeats: 5,
        color: 'Midnight Blue',
        licensePlate: 'UP16DE4004',
        registrationNumber: 'RC-UP16-4004',
        description: 'Agile hatchback ideal for navigating city traffic and easy parking in NCR.',
        features: ['Keyless Entry', 'Apple CarPlay', 'Steering Controls', 'Power Windows'],
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      name: 'Karan Malhotra',
      email: 'karan.malhotra@wheelswap.in',
      phone: '9811000005',
      city: 'Delhi',
      state: 'Delhi',
      aadhaar: '100020003005',
      license: 'DL-0320220005005',
      vehicle: {
        brand: 'Mahindra',
        model: 'Thar 4x4',
        year: 2022,
        vehicleType: VehicleType.SUV,
        fuelType: FuelType.DIESEL,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 4,
        color: 'Napoli Black',
        licensePlate: 'DL03EF5005',
        registrationNumber: 'RC-DL03-5005',
        description: 'Iconic 4x4 convertible hardtop Mahindra Thar. Ready for adventure and hill drives.',
        features: ['4x4 Low Range', 'Convertible Hardtop', 'Touchscreen', 'All-Terrain Tires'],
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      },
    },
  ];

  for (const item of cat1Data) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        email: item.email,
        name: item.name,
        phone: item.phone,
        password: defaultPassword,
        role: UserRole.USER,
        isEmailVerified: true,
        isKycVerified: true,
        city: item.city,
        state: item.state,
      },
    });

    await prisma.kycDocument.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        aadhaarNumber: item.aadhaar,
        licenseNumber: item.license,
        status: KycStatus.APPROVED,
        verifiedAt: new Date(),
        verifiedById: admin.id,
      },
    });

    const vehicle = await prisma.vehicle.upsert({
      where: { licensePlate: item.vehicle.licensePlate },
      update: {},
      create: {
        ownerId: user.id,
        brand: item.vehicle.brand,
        model: item.vehicle.model,
        year: item.vehicle.year,
        vehicleType: item.vehicle.vehicleType,
        fuelType: item.vehicle.fuelType,
        transmission: item.vehicle.transmission,
        numberOfSeats: item.vehicle.numberOfSeats,
        color: item.vehicle.color,
        licensePlate: item.vehicle.licensePlate,
        registrationNumber: item.vehicle.registrationNumber,
        description: item.vehicle.description,
        features: item.vehicle.features,
        city: item.city,
        state: item.state,
        status: VehicleStatus.ACTIVE,
        approvedAt: new Date(),
        approvedById: admin.id,
        images: {
          create: [
            {
              url: item.vehicle.imageUrl,
              publicId: `seed_${user.id}_primary`,
              isPrimary: true,
              order: 0,
            },
          ],
        },
      },
    });

    console.log(`  ✓ User: ${user.name} (${user.city}) | Vehicle: ${vehicle.brand} ${vehicle.model} [ACTIVE]`);
  }

  // ── CATEGORY 2: 3 Users with Unapproved/Pending KYC & Vehicles ──
  console.log('\n📦 Seeding Category 2: 3 Users with Unapproved/Pending KYC & Vehicles...');

  const cat2Data = [
    {
      name: 'Ritu Singh',
      email: 'ritu.singh@wheelswap.in',
      phone: '9811000006',
      city: 'Agra',
      state: 'Uttar Pradesh',
      aadhaar: '100020003006',
      license: 'UP-8020220006006',
      vehicle: {
        brand: 'Kia',
        model: 'Seltos',
        year: 2022,
        vehicleType: VehicleType.SUV,
        fuelType: FuelType.PETROL,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 5,
        color: 'Intense Red',
        licensePlate: 'UP80FG6006',
        registrationNumber: 'RC-UP80-6006',
        description: 'Feature-packed Kia Seltos GTX+. Dual-tone interior and Bose audio system.',
        features: ['Sunroof', 'Bose Speakers', 'Heads Up Display', 'Air Purifier'],
      },
    },
    {
      name: 'Deepak Joshi',
      email: 'deepak.joshi@wheelswap.in',
      phone: '9811000007',
      city: 'Noida',
      state: 'Uttar Pradesh',
      aadhaar: '100020003007',
      license: 'UP-1620210007007',
      vehicle: {
        brand: 'Royal Enfield',
        model: 'Classic 350',
        year: 2021,
        vehicleType: VehicleType.TWO_WHEELER,
        fuelType: FuelType.PETROL,
        transmission: Transmission.MANUAL,
        numberOfSeats: 2,
        color: 'Stealth Black',
        licensePlate: 'UP16GH7007',
        registrationNumber: 'RC-UP16-7007',
        description: 'Classic Royal Enfield 350 with dual-channel ABS and touring seat setup.',
        features: ['Dual Channel ABS', 'Tripper Navigation', 'Custom Exhaust'],
      },
    },
    {
      name: 'Ankit Saxena',
      email: 'ankit.saxena@wheelswap.in',
      phone: '9811000008',
      city: 'Delhi',
      state: 'Delhi',
      aadhaar: '100020003008',
      license: 'DL-0820210008008',
      vehicle: {
        brand: 'Toyota',
        model: 'Fortuner',
        year: 2021,
        vehicleType: VehicleType.SUV,
        fuelType: FuelType.DIESEL,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 7,
        color: 'Super White',
        licensePlate: 'DL08JK8008',
        registrationNumber: 'RC-DL08-8008',
        description: 'Powerful 7-seater SUV. High ground clearance and road presence.',
        features: ['Leather Seats', '4x4 System', 'Power Tailgate', '7 Seats'],
      },
    },
  ];

  for (const item of cat2Data) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        email: item.email,
        name: item.name,
        phone: item.phone,
        password: defaultPassword,
        role: UserRole.USER,
        isEmailVerified: true,
        isKycVerified: false,
        city: item.city,
        state: item.state,
      },
    });

    await prisma.kycDocument.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        aadhaarNumber: item.aadhaar,
        licenseNumber: item.license,
        status: KycStatus.PENDING,
      },
    });

    const vehicle = await prisma.vehicle.upsert({
      where: { licensePlate: item.vehicle.licensePlate },
      update: {},
      create: {
        ownerId: user.id,
        brand: item.vehicle.brand,
        model: item.vehicle.model,
        year: item.vehicle.year,
        vehicleType: item.vehicle.vehicleType,
        fuelType: item.vehicle.fuelType,
        transmission: item.vehicle.transmission,
        numberOfSeats: item.vehicle.numberOfSeats,
        color: item.vehicle.color,
        licensePlate: item.vehicle.licensePlate,
        registrationNumber: item.vehicle.registrationNumber,
        description: item.vehicle.description,
        features: item.vehicle.features,
        city: item.city,
        state: item.state,
        status: VehicleStatus.PENDING_APPROVAL,
      },
    });

    console.log(`  ✓ User: ${user.name} [KYC PENDING] | Vehicle: ${vehicle.brand} ${vehicle.model} [PENDING_APPROVAL]`);
  }

  // ── CATEGORY 3: 3 Users with Approved KYC but Unapproved Vehicles ──
  console.log('\n📦 Seeding Category 3: 3 Users with Approved KYC but Pending Vehicles...');

  const cat3Data = [
    {
      name: 'Neha Agarwal',
      email: 'neha.agarwal@wheelswap.in',
      phone: '9811000009',
      city: 'Agra',
      state: 'Uttar Pradesh',
      aadhaar: '100020003009',
      license: 'UP-8020220009009',
      vehicle: {
        brand: 'Hyundai',
        model: 'Verna',
        year: 2022,
        vehicleType: VehicleType.SEDAN,
        fuelType: FuelType.PETROL,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 5,
        color: 'Polar White',
        licensePlate: 'UP80LM9009',
        registrationNumber: 'RC-UP80-9009',
        description: 'Sleek Hyundai Verna Turbo with paddle shifters and ventilated seats.',
        features: ['Wireless Charging', 'Paddle Shifters', 'Sunroof', 'Digital Display'],
      },
    },
    {
      name: 'Manish Pandey',
      email: 'manish.pandey@wheelswap.in',
      phone: '9811000010',
      city: 'Noida',
      state: 'Uttar Pradesh',
      aadhaar: '100020003010',
      license: 'UP-1620210010010',
      vehicle: {
        brand: 'Tata',
        model: 'Safari',
        year: 2021,
        vehicleType: VehicleType.SUV,
        fuelType: FuelType.DIESEL,
        transmission: Transmission.MANUAL,
        numberOfSeats: 7,
        color: 'Orcus White',
        licensePlate: 'UP16NP1010',
        registrationNumber: 'RC-UP16-1010',
        description: 'Flagship Tata Safari 7-seater SUV with Captain seats in middle row.',
        features: ['Captain Seats', 'Panoramic Sunroof', 'JBL Audio', 'Terrain Modes'],
      },
    },
    {
      name: 'Simran Kaur',
      email: 'simran.kaur@wheelswap.in',
      phone: '9811000011',
      city: 'Delhi',
      state: 'Delhi',
      aadhaar: '100020003011',
      license: 'DL-0520230011011',
      vehicle: {
        brand: 'Honda',
        model: 'Activa 6G',
        year: 2023,
        vehicleType: VehicleType.TWO_WHEELER,
        fuelType: FuelType.PETROL,
        transmission: Transmission.AUTOMATIC,
        numberOfSeats: 2,
        color: 'Matte Axis Gray',
        licensePlate: 'DL05RS1111',
        registrationNumber: 'RC-DL05-1111',
        description: 'Brand new Honda Activa 6G scooter. Very fuel-efficient for quick city errands.',
        features: ['Silent Start', 'Telescopic Suspension', 'Engine Start-Stop'],
      },
    },
  ];

  for (const item of cat3Data) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        email: item.email,
        name: item.name,
        phone: item.phone,
        password: defaultPassword,
        role: UserRole.USER,
        isEmailVerified: true,
        isKycVerified: true,
        city: item.city,
        state: item.state,
      },
    });

    await prisma.kycDocument.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        aadhaarNumber: item.aadhaar,
        licenseNumber: item.license,
        status: KycStatus.APPROVED,
        verifiedAt: new Date(),
        verifiedById: admin.id,
      },
    });

    const vehicle = await prisma.vehicle.upsert({
      where: { licensePlate: item.vehicle.licensePlate },
      update: {},
      create: {
        ownerId: user.id,
        brand: item.vehicle.brand,
        model: item.vehicle.model,
        year: item.vehicle.year,
        vehicleType: item.vehicle.vehicleType,
        fuelType: item.vehicle.fuelType,
        transmission: item.vehicle.transmission,
        numberOfSeats: item.vehicle.numberOfSeats,
        color: item.vehicle.color,
        licensePlate: item.vehicle.licensePlate,
        registrationNumber: item.vehicle.registrationNumber,
        description: item.vehicle.description,
        features: item.vehicle.features,
        city: item.city,
        state: item.state,
        status: VehicleStatus.PENDING_APPROVAL,
      },
    });

    console.log(`  ✓ User: ${user.name} [KYC APPROVED] | Vehicle: ${vehicle.brand} ${vehicle.model} [PENDING_APPROVAL]`);
  }

  console.log('\n🎉 Database successfully seeded with 11 Users, KYC records, and Vehicles!');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('🔑 Common User Password: Password@123');
  console.log('🔑 Super Admin: admin@wheelswap.in / Admin@123');
  console.log('📍 Cities Covered: Noida, Agra, Delhi');
  console.log('─────────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
