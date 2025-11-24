import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata = {
    title: 'Pricing - InTime Academy',
    description: 'Simple, transparent pricing for your career transformation.',
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background font-body">
            {/* Header */}
            <div className="bg-forest-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')] bg-center" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">Invest in Your Future</h1>
                    <p className="text-xl text-forest-200 max-w-2xl mx-auto leading-relaxed">
                        Choose the plan that fits your learning style. No hidden fees, just results.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
                    {/* Monthly Plan */}
                    <Card className="flex flex-col shadow-elevation-lg border-0 h-full">
                        <CardHeader className="p-8 text-center">
                            <h3 className="text-2xl font-heading font-bold text-charcoal">Monthly</h3>
                            <div className="mt-4 mb-2">
                                <span className="text-5xl font-bold text-charcoal">$499</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-sm text-gray-500">Flexible learning, cancel anytime</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex-grow">
                            <ul className="space-y-4">
                                {[
                                    'Access to one specific track',
                                    'AI Mentor support (24/7)',
                                    'Hands-on labs & projects',
                                    'Community access',
                                    'Certificate of completion',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                                        <span className="text-gray-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Link href="/academy/courses" className="w-full">
                                <Button variant="outline" className="w-full h-12 text-lg border-gray-300 text-charcoal hover:border-forest-500 hover:text-forest-600 hover:bg-white">
                                    Select Course
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Package Plan (Best Value) */}
                    <Card className="flex flex-col shadow-elevation-xl border-2 border-forest-500 relative h-full transform md:-translate-y-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-forest-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm tracking-wide">
                            MOST POPULAR
                        </div>
                        <CardHeader className="p-8 text-center bg-forest-50/50">
                            <h3 className="text-2xl font-heading font-bold text-forest-900">Career Package</h3>
                            <div className="mt-4 mb-2">
                                <span className="text-5xl font-bold text-forest-700">$898</span>
                                <span className="text-gray-500">/total</span>
                            </div>
                            <p className="text-sm text-forest-600 font-medium">Save $100 vs Monthly</p>
                        </CardHeader>
                        <CardContent className="p-8 flex-grow">
                            <ul className="space-y-4">
                                {[
                                    'Full 8-week program access',
                                    'Priority AI Mentor support',
                                    'Guaranteed Job Placement Support',
                                    'Resume & Interview Prep',
                                    '1-on-1 Career Coaching',
                                    'Lifetime course access',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-rust flex-shrink-0" />
                                        <span className="text-charcoal text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Link href="/academy/courses" className="w-full">
                                <Button className="w-full h-12 text-lg btn-secondary shadow-lg">
                                    Get Started
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Enterprise Plan */}
                    <Card className="flex flex-col shadow-elevation-lg border-0 h-full">
                        <CardHeader className="p-8 text-center">
                            <h3 className="text-2xl font-heading font-bold text-charcoal">Enterprise</h3>
                            <div className="mt-4 mb-2">
                                <span className="text-5xl font-bold text-charcoal">Custom</span>
                            </div>
                            <p className="text-sm text-gray-500">For teams & organizations</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex-grow">
                            <ul className="space-y-4">
                                {[
                                    'Unlimited access for teams',
                                    'Custom learning paths',
                                    'Progress analytics dashboard',
                                    'Dedicated account manager',
                                    'SLA support',
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-forest-500 flex-shrink-0" />
                                        <span className="text-gray-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Link href="/contact" className="w-full">
                                <Button variant="outline" className="w-full h-12 text-lg border-gray-300 text-charcoal hover:bg-gray-50">
                                    Contact Sales
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-24">
                    <h2 className="text-3xl font-heading font-bold text-center text-charcoal mb-12">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-medium text-charcoal hover:text-forest-600">What happens if I don't get a job?</AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                Our placement support continues until you're hired. We work with a vast network of partners and provide dedicated recruiting support to ensure your success.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-medium text-charcoal hover:text-forest-600">Can I switch courses after enrolling?</AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                Yes, you can switch tracks within the first 7 days of enrollment without any penalty. After that, please contact support for assistance.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="text-lg font-medium text-charcoal hover:text-forest-600">Is the training live or self-paced?</AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                It's a hybrid model. You get access to self-paced high-quality video content and labs, combined with live office hours and mentorship sessions.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="text-lg font-medium text-charcoal hover:text-forest-600">Do you offer refunds?</AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                We offer a 7-day money-back guarantee. If you're not satisfied with the course content, you can request a full refund within the first week.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
