import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newServices = [
  // 1. Home & Personal Care Services
  {
    title: "Tailor Services at Home",
    description: "On-demand tailoring and stitching support.",
    startingPrice: "₹499/hr",
    rating: 4.8,
    badge: "Trending",
    iconName: "Scissors",
    gradient: "from-[#F9A826] to-[#F27121]",
  },
  {
    title: "Post-Natal Care Services",
    description: "Trained women attendants for new mothers and infants.",
    startingPrice: "₹1,999/day",
    rating: 5.0,
    badge: "Popular",
    iconName: "Baby",
    gradient: "from-[#FFB7B2] to-[#E28495]",
  },
  // 2. Repair & Utility Services
  {
    title: "Women Repair Services",
    description: "Basic household electrical, plumbing and carpentry support.",
    startingPrice: "₹599/visit",
    rating: 4.7,
    badge: "Freshly Added",
    iconName: "Wrench",
    gradient: "from-[#4B79A1] to-[#283E51]",
  },
  {
    title: "Appliance Assistance",
    description: "Minor troubleshooting and appliance maintenance.",
    startingPrice: "₹499/visit",
    rating: 4.8,
    badge: "Trending",
    iconName: "Settings",
    gradient: "from-[#8E2DE2] to-[#4A00E0]",
  },
  // 3. Safety & Security Services
  {
    title: "Women Hostel Attendants",
    description: "Trusted women-led safety support for residential environments.",
    startingPrice: "₹1,499/day",
    rating: 4.9,
    badge: "Popular",
    iconName: "Building",
    gradient: "from-[#11998E] to-[#38EF7D]",
  },
  {
    title: "Women Security for Jewellery Buying",
    description: "Secure companionship for high-value personal shopping.",
    startingPrice: "₹999/visit",
    rating: 4.9,
    badge: "Freshly Added",
    iconName: "Gem",
    gradient: "from-[#F7971E] to-[#FFD200]",
  },
  {
    title: "Event Security",
    description: "Professional female security for social and corporate events.",
    startingPrice: "₹2,499/event",
    rating: 4.8,
    badge: "Popular",
    iconName: "Shield",
    gradient: "from-[#CB2D3E] to-[#EF473A]",
  },
  // 4. Travel & Mobility Services
  {
    title: "Women Travel Buddy Services",
    description: "Safe and reliable travel companionship and transportation support.",
    startingPrice: "₹1,299/day",
    rating: 4.9,
    badge: "Popular",
    iconName: "Luggage",
    gradient: "from-[#00B4DB] to-[#0083B0]",
  },
  // 5. Event & Lifestyle Services
  {
    title: "Women Event Managers",
    description: "Support for social and cultural activities.",
    startingPrice: "₹3,999/event",
    rating: 4.8,
    badge: "Trending",
    iconName: "Mic",
    gradient: "from-[#DA4453] to-[#89216B]",
  },
  {
    title: "Domestic Support Staff",
    description: "Trusted support for household management.",
    startingPrice: "₹899/day",
    rating: 4.9,
    badge: "Popular",
    iconName: "Home",
    gradient: "from-[#1D976C] to-[#93F9B9]",
  }
];

async function main() {
  for (const service of newServices) {
    const existing = await prisma.service.findFirst({
      where: { title: service.title }
    });
    
    if (!existing) {
      await prisma.service.create({
        data: service
      });
      console.log(`Created service: ${service.title}`);
    } else {
      console.log(`Service already exists: ${service.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
