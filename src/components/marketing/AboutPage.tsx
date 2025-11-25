'use client';

import React from 'react';
import Link from 'next/link';
import {
  Target,
  Eye,
  Heart,
  Users,
  ArrowRight,
  Award,
  Globe,
  Lightbulb,
  Shield,
  Zap,
  Building2,
  MapPin,
  Linkedin,
  Twitter
} from 'lucide-react';
import { MarketingNavbar, Footer } from '@/components/templates';
import { FullScreenHero } from './shared/FullScreenHero';

const LEADERSHIP_TEAM = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Founder',
    image: null,
    bio: 'Former Guidewire executive with 15+ years in insurance technology.',
    linkedin: '#'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Chief Technology Officer',
    image: null,
    bio: 'Ex-Google engineer specializing in AI and cloud architecture.',
    linkedin: '#'
  },
  {
    name: 'Jennifer Williams',
    role: 'Chief Operating Officer',
    image: null,
    bio: 'Operations leader with experience scaling staffing firms.',
    linkedin: '#'
  },
  {
    name: 'David Park',
    role: 'VP of Training',
    image: null,
    bio: 'Certified Guidewire instructor with 500+ trained professionals.',
    linkedin: '#'
  }
];

const VALUES = [
  { icon: Shield, title: 'Integrity', description: 'We operate with transparency and honesty in every interaction.' },
  { icon: Zap, title: 'Excellence', description: 'We strive for the highest standards in everything we do.' },
  { icon: Users, title: 'People First', description: 'Our success is measured by the success of our people.' },
  { icon: Lightbulb, title: 'Innovation', description: 'We continuously seek better ways to serve our clients and talent.' }
];

const MILESTONES = [
  { year: '2018', title: 'Founded', description: 'InTime Solutions launched with a focus on Guidewire staffing.' },
  { year: '2019', title: 'Academy Launch', description: 'Launched InTime Academy to train new Guidewire talent.' },
  { year: '2021', title: 'National Expansion', description: 'Expanded operations to serve clients across all 50 states.' },
  { year: '2023', title: 'AI Integration', description: 'Integrated AI-powered tools for better talent matching.' },
  { year: '2024', title: '500+ Placements', description: 'Reached milestone of 500+ successful placements.' }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory">
      <MarketingNavbar />

      {/* Hero Section */}
      <FullScreenHero
        badge={{ icon: <Building2 size={16} />, text: 'About Us' }}
        title={
          <>
            Transforming{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
              Careers
            </span>
            <br />
            Building{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-400 to-forest-500">
              Futures
            </span>
          </>
        }
        subtitle="We're on a mission to bridge the gap between exceptional talent and transformative opportunities in the technology sector."
      >
        <Link
          href="/careers"
          className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-premium-lg hover:shadow-premium-xl transition-all duration-300"
        >
          Join Our Team
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
        >
          Get in Touch
        </Link>
      </FullScreenHero>

      {/* Mission Section */}
      <section id="mission" className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-forest-100 text-forest-700 mb-8">
                  <Target size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Our Mission</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-8 leading-tight">
                  Empowering Talent,{' '}
                  <span className="text-forest-600">Enabling Success</span>
                </h2>
                <p className="text-lg text-charcoal-600 leading-relaxed mb-6">
                  Our mission is to transform the technology staffing industry by providing exceptional
                  training, placement, and support services that empower professionals to achieve their
                  career goals while helping organizations build world-class teams.
                </p>
                <p className="text-lg text-charcoal-600 leading-relaxed">
                  We believe that with the right training, mentorship, and opportunities, anyone can
                  build a rewarding career in technology. That's why we've invested heavily in our
                  Academy program and our talent development initiatives.
                </p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-forest-100 to-gold-50 rounded-3xl p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-forest-200 rounded-full blur-3xl opacity-50" />
                  <div className="relative">
                    <div className="text-7xl font-heading font-black text-forest-600 mb-4">500+</div>
                    <div className="text-xl font-medium text-charcoal-700 mb-8">Careers Transformed</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                          <Award size={24} className="text-gold-500" />
                        </div>
                        <div>
                          <div className="font-bold text-charcoal-900">95% Success Rate</div>
                          <div className="text-sm text-charcoal-500">Job placement within 90 days</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                          <Globe size={24} className="text-forest-500" />
                        </div>
                        <div>
                          <div className="font-bold text-charcoal-900">50+ States</div>
                          <div className="text-sm text-charcoal-500">Nationwide coverage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-28 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-forest-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-8">
              <Eye size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Our Vision</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white mb-8 leading-tight">
              The Future of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Tech Talent
              </span>
            </h2>
            <p className="text-xl text-charcoal-300 leading-relaxed mb-12">
              We envision a world where geographic boundaries don't limit career opportunities,
              where talent is recognized for its potential, and where continuous learning is the
              pathway to success. By 2030, we aim to have transformed 10,000 careers and become
              the most trusted name in technology staffing and training.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="text-4xl font-heading font-black text-gold-400 mb-2">10K</div>
                <div className="text-charcoal-300">Careers to Transform</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="text-4xl font-heading font-black text-gold-400 mb-2">100+</div>
                <div className="text-charcoal-300">Enterprise Partners</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="text-4xl font-heading font-black text-gold-400 mb-2">Global</div>
                <div className="text-charcoal-300">Reach by 2030</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-28 bg-ivory">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-forest-100 text-forest-700 mb-8">
              <Heart size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Our Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
              What We <span className="text-forest-600">Stand For</span>
            </h2>
            <p className="text-lg text-charcoal-500">
              The principles that guide every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {VALUES.map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-elevation-md border border-charcoal-100/50 text-center">
                <div className="w-16 h-16 rounded-xl bg-forest-100 flex items-center justify-center mx-auto mb-6">
                  <value.icon size={28} className="text-forest-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-charcoal-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-charcoal-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Note Section */}
      <section id="founder" className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-charcoal-900 to-forest-900 rounded-3xl p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-8">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">From Our Founder</span>
                </div>

                <blockquote className="text-2xl md:text-3xl text-white font-light leading-relaxed mb-10 italic">
                  "When I started InTime, I had a simple belief: that everyone deserves access to
                  quality training and meaningful career opportunities. Too many talented individuals
                  are held back by circumstances, not ability. We're here to change that equation."
                </blockquote>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl font-heading font-bold text-charcoal-900">
                    SC
                  </div>
                  <div>
                    <div className="text-xl font-heading font-bold text-white">Sarah Chen</div>
                    <div className="text-charcoal-400">Founder & CEO, InTime Solutions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="team" className="py-28 bg-ivory">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
              Leadership <span className="text-gold-500">Team</span>
            </h2>
            <p className="text-lg text-charcoal-500">
              Meet the people driving InTime's mission forward.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {LEADERSHIP_TEAM.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-elevation-md border border-charcoal-100/50 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-forest-100 to-gold-50 flex items-center justify-center mx-auto mb-6 text-3xl font-heading font-bold text-forest-600">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-sm text-forest-600 font-medium mb-4">
                  {member.role}
                </div>
                <p className="text-sm text-charcoal-500 mb-4">
                  {member.bio}
                </p>
                <a href={member.linkedin} className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-700 transition-colors">
                  <Linkedin size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-charcoal-900 mb-6">
              Our <span className="text-forest-600">Journey</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-forest-200" />

              {MILESTONES.map((milestone, i) => (
                <div key={i} className={`relative flex items-start gap-8 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-20 md:pl-0`}>
                    <div className="bg-white rounded-2xl p-6 shadow-elevation-md border border-charcoal-100/50 inline-block">
                      <div className="text-sm font-bold text-forest-600 uppercase tracking-widest mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-charcoal-500 text-sm">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-forest-500 border-4 border-white shadow-md transform -translate-x-1/2" />
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-28 bg-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
              Our <span className="text-gold-400">Locations</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-xl bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                <MapPin size={24} className="text-gold-400" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Headquarters</h3>
              <p className="text-charcoal-400">Dallas, TX</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-xl bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                <MapPin size={24} className="text-gold-400" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">East Coast</h3>
              <p className="text-charcoal-400">New York, NY</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-14 h-14 rounded-xl bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                <MapPin size={24} className="text-gold-400" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">West Coast</h3>
              <p className="text-charcoal-400">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-forest-900 to-charcoal-900">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-6">
              Ready to Join Our Story?
            </h2>
            <p className="text-lg text-charcoal-300 mb-8">
              Whether you're looking to transform your career or partner with us, we'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/careers"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
              >
                View Careers
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/10 text-white border border-white/20 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/20 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
