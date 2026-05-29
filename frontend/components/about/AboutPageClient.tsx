'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { type Category } from '@/services/online-services/frontendCategoryService';
import { generateCategoryUrl } from '@/lib/slugify';

interface AboutPageClientProps {
  initialCategories: Category[];
}

export default function AboutPageClient({ initialCategories }: AboutPageClientProps) {
  const [categories] = useState<Category[]>(initialCategories);

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="text-[#FFD700] hover:text-[#FFCA28]">Home</Link>
            <span>/</span>
            <span className="text-gray-900">About Us</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Content - About Text */}
          <div className="w-full lg:w-[76%]">
            <div className="prose max-w-none">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Welcome to Firecrackers</h1>
              
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                Welcome to Firecrackers, your trusted online destination for premium quality firecrackers, sparklers, and festive items. We are committed to bringing the finest and safest crackers directly to your doorstep, making every celebration memorable, vibrant, and joyful for families across India. 🎆
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">Our Story</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                Founded with a passion for celebrations and festive traditions, Firecrackers started with a vision to make premium quality crackers accessible to everyone. Today, we have grown into a trusted online marketplace serving thousands of customers during Diwali, New Year, weddings, and every joyful occasion.
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">What We Offer</h2>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                <li>Ground Crackers: Chakkars, flower pots, snakes and ground-based items for all ages</li>
                <li>Sky Rockets & Aerial Bombs: Explosive sky-bursting crackers for spectacular shows</li>
                <li>Sparklers (Phooljhadi): Hand-held sparklers, pencils, and fancy sparkle items</li>
                <li>Sound Crackers: Atom bombs, laxmi bombs, and traditional crackers</li>
                <li>Gift Boxes & Combo Packs: Curated festive packs for gifting and family celebrations</li>
                <li>Kids-Safe Crackers: Fun, safe items specially curated for children</li>
              </ul>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">Pan-India Delivery</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                We deliver safely packed and certified firecrackers across India. Our specially designed packaging ensures every product reaches you in perfect condition, ready to light up your celebrations.
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">Why Choose Firecrackers?</h2>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                <li>🔒 Safety Certified: All products are PESO-certified and meet government safety standards</li>
                <li>💰 Best Prices: Competitive pricing with bulk discounts and seasonal offers</li>
                <li>🚀 Fast Delivery: Reliable pan-India delivery for every festive occasion</li>
                <li>🎆 Wide Selection: Thousands of crackers across all categories and budgets</li>
                <li>🎊 Festival Expertise: Curated collections for Diwali, New Year, weddings & more</li>
                <li>📞 24/7 Support: Our customer service team is always here to help</li>
              </ul>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[24%]">
            <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-4">
              {/* Search Bar */}
              <div className="bg-white border rounded-lg p-3 sm:p-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm text-gray-600"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFD700]">
                    <IconSearch size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>


              {/* Categories */}
              <div className="bg-white border rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Categories</h3>
                <div className="w-12 sm:w-16 h-1 bg-[#FFD700] mb-4 sm:mb-6"></div>
                
                <div className="space-y-2 sm:space-y-3">
                  {categories.map((category) => (
                    <Link 
                      key={category.id}
                      href={generateCategoryUrl(category)}
                      className="flex items-center justify-between py-1.5 sm:py-2 hover:text-[#FFD700] transition group"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-base text-gray-700 group-hover:text-[#FFD700]">{category.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Advertisement */}
              <div className="bg-gradient-to-br from-[#111111] to-[#2a2a2a] rounded-lg overflow-hidden p-4 sm:p-6">
                <p className="text-xs sm:text-sm text-[#FFD700] mb-1">🎆 Festive Offers</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  Save up to<br />
                  40% OFF<br />
                  This Diwali
                </h3>
                <Link 
                  href="/products"
                  className="bg-[#FFD700] text-gray-900 px-4 sm:px-6 py-2 rounded-md hover:bg-[#FFCA28] transition flex items-center gap-2 text-xs sm:text-sm font-medium w-fit"
                >
                  Shop now
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
