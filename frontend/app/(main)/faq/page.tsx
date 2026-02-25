'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useCurrency } from '@/hooks/useCurrency';
import { usePageSEO } from '@/lib/seo';

export default function FAQPage() {
  const currencySymbol = useCurrency();

  // Apply dynamic SEO
  usePageSEO('/faq');
  
  const faqCategories = [
    {
      id: 1,
      title: 'Orders & Delivery',
      faqs: [
        { question: 'How fast is delivery?', answer: 'We deliver in just 10 minutes! Our express delivery ensures your groceries reach you fresh and fast.' },
        { question: 'What are the delivery charges?', answer: `Delivery is FREE on orders above ${currencySymbol}499. For orders below ${currencySymbol}499, a delivery fee of ${currencySymbol}40 applies.` },
        { question: 'Can I track my order?', answer: 'Yes! Once your order is placed, you can track it in real-time through the app or website.' },
      ]
    },
  {
    id: 2,
    title: 'Payment',
    faqs: [
      { question: 'What payment methods do you accept?', answer: 'We accept UPI, Credit/Debit Cards, Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery.' },
      { question: 'Is online payment safe?', answer: 'Yes, all payments are secured with 256-bit SSL encryption. We never store your card details.' },
    ]
  },
  {
    id: 3,
    title: 'Returns & Refunds',
    faqs: [
      { question: 'What is your return policy?', answer: 'We accept returns for damaged or wrong items. Fresh produce can be returned at the time of delivery.' },
      { question: 'When will I get my refund?', answer: 'Refunds are processed within 2-3 business days and credited to your original payment method.' },
    ]
  }
];

  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleFAQ = (categoryId: number, faqIndex: number) => {
    const key = `${categoryId}-${faqIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Link href="/" className="text-[#E63946] hover:underline">Home</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium">FAQ</span>
            </div>
          </div>
        </div>

        <div className="bg-[#E63946] py-6 sm:py-10">
          <div className="container mx-auto px-3 sm:px-4 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Frequently Asked Questions</h1>
            <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">Find answers to common questions</p>
            <div className="max-w-md mx-auto relative">
              <IconSearch size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 sm:w-[18px] sm:h-[18px]" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 rounded-lg focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">{category.title}</h2>
                <div className="space-y-2">
                  {category.faqs.map((faq, index) => {
                    const key = `${category.id}-${index}`;
                    const isOpen = openItems[key];
                    return (
                      <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                        <button
                          onClick={() => toggleFAQ(category.id, index)}
                          className="w-full flex items-center justify-between text-left py-2 hover:text-[#E63946]"
                        >
                          <span className="font-medium text-gray-800 text-xs sm:text-sm pr-2">{faq.question}</span>
                          <IconChevronDown size={14} className={`text-gray-500 transition-transform flex-shrink-0 sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && <p className="text-gray-600 text-xs sm:text-sm pb-2">{faq.answer}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-6 sm:mt-8 bg-[#E63946] rounded-lg p-4 sm:p-6 text-center text-white">
            <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Still have questions?</h3>
            <p className="mb-3 sm:mb-4 opacity-90 text-sm">Our support team is here to help</p>
            <Link href="/contact" className="inline-block bg-white text-[#E63946] px-5 sm:px-6 py-2 rounded-lg font-medium hover:bg-gray-100 text-sm">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
