'use client';

import { useState } from 'react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How is InTime different from traditional ATS or CRM systems?',
      answer: 'InTime is a complete operating system for staffing. While ATS and CRMs store data, InTime actively identifies cross-selling opportunities, automates workflows, and connects your entire operation.',
    },
    {
      question: 'What is the typical ROI and timeline?',
      answer: 'Most clients see ROI within 30-60 days. On average, firms recover $847K in previously missed revenue opportunities in the first year.',
    },
    {
      question: 'How long does implementation take?',
      answer: 'Basic setup takes 2-3 weeks. Full implementation with data migration and training typically takes 30-45 days.',
    },
    {
      question: 'Do we own our data?',
      answer: 'Absolutely. 100% of your data belongs to you. You can export everything at any time in standard formats.',
    },
    {
      question: 'What integrations do you support?',
      answer: 'We integrate with 50+ platforms including major job boards, email systems, calendars, and can build custom integrations via our API.',
    },
    {
      question: 'Is my data secure?',
      answer: 'We are SOC 2 Type II certified, GDPR compliant, and use bank-level encryption. Data is hosted on AWS with 99.99% uptime SLA.',
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl lg:text-5xl font-bold text-black mb-16">
          Frequently asked questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-2 border-gray-200">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-8 py-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-medium text-black">{faq.question}</span>
                <span className="text-2xl text-black flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
