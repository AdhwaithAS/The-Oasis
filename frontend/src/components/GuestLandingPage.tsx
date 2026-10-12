'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Room, Reservation } from '../lib/types';
import {
  Search,
  Check,
  Plus,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  FileText,
  AlertCircle,
  Hotel,
  Home,
  Crown,
  Castle,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Clock,
  Compass,
  Heart,
  SlidersHorizontal,
  LogIn
} from 'lucide-react';

interface GuestLandingPageProps {
  rooms: Room[];
  reservations: Reservation[];
  onOpenBooking: (room?: Room | null) => void;
  onViewBill: (reservationId: string) => void;
}

export default function GuestLandingPage({
  rooms,
  reservations,
  onOpenBooking,
  onViewBill,
}: GuestLandingPageProps) {
  // Navigation active tab
  const [navTab, setNavTab] = useState<'stays' | 'experiences'>('stays');

  // Hero search
  const [heroSearch, setHeroSearch] = useState('');

  // Category filter in About us section
  const [category, setCategory] = useState<'Hotels' | 'Cabins' | 'Luxe' | 'Castle'>('Hotels');

  // Floating booking card form state (over Sydney photo)
  const [widgetCheckIn, setWidgetCheckIn] = useState('2026-10-14');
  const [widgetCheckOut, setWidgetCheckOut] = useState('2026-10-25');
  const [widgetGuests, setWidgetGuests] = useState('2 Adults, 1 Room');

  // Weekly itinerary filter & expanded item
  const [itineraryFilter, setItineraryFilter] = useState<'best' | 'rec' | 'popular' | 'cheaper'>('rec');
  const [expandedCity, setExpandedCity] = useState<string>('Barcelona');

  // Lookup existing booking state
  const [lookupQuery, setLookupQuery] = useState('');
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);
  const [lookupError, setLookupError] = useState('');

  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setFoundReservation(null);

    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      setLookupError('Please enter a Reservation ID or Email address.');
      return;
    }

    const found = reservations.find(
      (r) =>
        r.reservationId.toLowerCase() === q ||
        r.customer?.email?.toLowerCase() === q
    );

    if (found) {
      setFoundReservation(found);
    } else {
      setLookupError(`No active reservation found matching "${lookupQuery.trim()}".`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Curated fallback room associations
  const standardRoom = rooms.find((r) => r.roomType === 'Standard') || rooms[0];
  const suiteRoom = rooms.find((r) => r.roomType === 'Suite') || rooms[rooms.length - 1];

  return (
    <div style={{ background: '#fbfbfc', color: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* =========================================================================
          1. HEADER & TOP PILL NAVIGATION (Matches Wanderlust Navbar in Image)
          ========================================================================= */}
      <header style={{
        maxWidth: '1360px',
        width: '100%',
        margin: '0 auto',
        padding: '14px 16px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(251, 251, 252, 0.95)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Left: Brand + Stays / Experiences Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={scrollToTop}>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a' }}>
              The Oasis
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f3f7',
            padding: '3px',
            borderRadius: '9999px',
            gap: '2px',
          }}>
            <button
              onClick={() => setNavTab('stays')}
              style={{
                padding: '5px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: navTab === 'stays' ? '#111827' : 'transparent',
                color: navTab === 'stays' ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Stays
            </button>
            <button
              onClick={() => setNavTab('experiences')}
              style={{
                padding: '5px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: navTab === 'experiences' ? '#111827' : 'transparent',
                color: navTab === 'experiences' ? '#ffffff' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Experiences
            </button>
          </div>
        </div>

        {/* Right: Monetize / Lookup / Staff Portal + Avatar Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="#lookup"
            className="hide-on-mobile"
            style={{
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#334155',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            Find My Booking
          </a>

          <Link
            href="/login"
            style={{
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#334155',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <LogIn size={15} style={{ color: '#64748b' }} />
            <span className="hide-on-mobile">Staff Portal</span>
            <span className="show-on-mobile">Staff</span>
          </Link>

          {/* Avatar Profile Indicator */}
          <div
            onClick={() => onOpenBooking(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px 4px 5px',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#111827',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}>
              1
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
              Book Stay
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (Matches Reference Panoramic Pod Visual & Search Pill)
          ========================================================================= */}
      <section style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '10px 16px 36px' }}>
        {/* Caption Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          fontSize: '0.84rem',
          color: '#64748b',
          fontWeight: 600,
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div>Find unique stays that work for you</div>
          <div style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#0f172a',
          }}>
            Popular 2024
          </div>
        </div>

        {/* Hero Visual Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '440px',
          borderRadius: 'clamp(20px, 4vw, 32px)',
          overflow: 'hidden',
          boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.18)',
          backgroundImage: 'url(/images/wanderlust_hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(20px, 4vw, 40px)',
        }}>
          {/* Subtle gradient vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.7) 100%)',
          }} />

          {/* Lower Content Row */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            width: '100%',
          }}>
            {/* Headline */}
            <div>
              <h1 style={{
                fontSize: 'clamp(2.1rem, 5.5vw, 3.8rem)',
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                textShadow: '0 4px 16px rgba(0,0,0,0.4)',
                margin: 0,
              }}>
                Stay Unique,<br />Travel Freely.
              </h1>
            </div>

            {/* Embedded Floating Pill Search Bar */}
            <div style={{ width: 'auto', maxWidth: '100%' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onOpenBooking(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 6px 6px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2)',
                  maxWidth: '100%',
                }}
              >
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search destinations"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    width: 'clamp(130px, 30vw, 180px)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '9px 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#111827',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  <span>Search</span>
                  <Search size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. "ABOUT US" STATEMENT & CATEGORY PILLS (Matches Reference Exactly)
          ========================================================================= */}
      <section style={{
        maxWidth: '1360px',
        width: '100%',
        margin: '0 auto',
        padding: '36px 16px 44px',
        textAlign: 'center',
      }}>
        {/* Small Centered "About us" text */}
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '14px',
        }}>
          About us
        </div>

        {/* Large Editorial Headline */}
        <h2 style={{
          fontSize: 'clamp(1.6rem, 3.8vw, 2.75rem)',
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: '-0.03em',
          color: '#0f172a',
          maxWidth: '820px',
          margin: '0 auto 28px',
        }}>
          Each space is thoughtfully curated to spark connection and create lasting memories.
        </h2>

        {/* Category Filter Pills (Circle Icons) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '32px',
          maxWidth: '100%',
        }}>
          <button
            onClick={() => setCategory('Hotels')}
            className={`category-pill ${category === 'Hotels' ? 'active' : ''}`}
          >
            <div className="category-icon-circle">
              <Hotel size={16} />
            </div>
            <span>Hotels</span>
          </button>

          <button
            onClick={() => setCategory('Cabins')}
            className={`category-pill ${category === 'Cabins' ? 'active' : ''}`}
          >
            <div className="category-icon-circle">
              <Home size={16} />
            </div>
            <span>Cabins</span>
          </button>

          <button
            onClick={() => setCategory('Luxe')}
            className={`category-pill ${category === 'Luxe' ? 'active' : ''}`}
          >
            <div className="category-icon-circle">
              <Sparkles size={16} />
            </div>
            <span>Luxe</span>
          </button>

          <button
            onClick={() => setCategory('Castle')}
            className={`category-pill ${category === 'Castle' ? 'active' : ''}`}
          >
            <div className="category-icon-circle">
              <Castle size={16} />
            </div>
            <span>Castle</span>
          </button>
        </div>

        {/* 3-Image Architectural Montage from Reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
          maxWidth: '980px',
          margin: '0 auto',
        }}>
          <div style={{
            height: 'clamp(180px, 24vw, 240px)',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundImage: 'url(/images/dest_sydney.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          }} />
          <div style={{
            height: 'clamp(180px, 24vw, 240px)',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundImage: 'url(/images/stay_domes.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          }} />
          <div style={{
            height: 'clamp(180px, 24vw, 240px)',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundImage: 'url(/images/stay_pod.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          }} />
        </div>
      </section>

      {/* =========================================================================
          4. "NEARBY" CURATED STAYS (Matches 3-Column Image Cards Exactly)
          ========================================================================= */}
      <section style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '16px 16px 54px' }}>
        {/* Nearby Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div style={{
            padding: '5px 14px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#0f172a',
          }}>
            Nearby
          </div>

          <p style={{
            fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
            fontWeight: 700,
            color: '#1e293b',
            maxWidth: '780px',
            lineHeight: 1.45,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Find unique stays, unforgettable experiences, and endless exploration—where The Oasis meets wonder, adventure, and discovery.
          </p>
        </div>

        {/* 3 Stays Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '20px',
        }}>
          {/* Card 1: Near the beach */}
          <div
            onClick={() => onOpenBooking(standardRoom)}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            <div style={{
              height: 'clamp(260px, 34vw, 380px)',
              borderRadius: '28px',
              overflow: 'hidden',
              backgroundImage: 'url(/images/stay_domes.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              marginBottom: '14px',
            }}>
              {/* Badge top-left */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(12px)',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#0f172a',
              }}>
                Whitehaven
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  Near the beach
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  122 kilometers away • From ₹110 / night
                </div>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                New properties
              </span>
            </div>
          </div>

          {/* Card 2: Pets welcome (Curved Pod with Review Badge) */}
          <div
            onClick={() => onOpenBooking(suiteRoom)}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            <div style={{
              height: 'clamp(260px, 34vw, 380px)',
              borderRadius: '28px',
              overflow: 'hidden',
              backgroundImage: 'url(/images/stay_pod.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              marginBottom: '14px',
            }}>
              {/* Center Pill */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(12px)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0f172a',
              }}>
                Dome
              </div>

              {/* Review Pill overlay from reference */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                  345+ Reviews
                </span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Star size={12} fill="#eab308" color="#eab308" />
                  <Star size={12} fill="#eab308" color="#eab308" />
                  <Star size={12} fill="#eab308" color="#eab308" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  Pets welcome
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  1,322 kilometers away • From ₹240 / night
                </div>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                New
              </span>
            </div>
          </div>

          {/* Card 3: Swimming pools */}
          <div
            onClick={() => onOpenBooking(suiteRoom)}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            <div style={{
              height: 'clamp(260px, 34vw, 380px)',
              borderRadius: '28px',
              overflow: 'hidden',
              backgroundImage: 'url(/images/stay_pool.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              marginBottom: '14px',
            }}>
              {/* Top-right icon */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
              }}>
                <Heart size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  Swimming pools
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  1,522 kilometers away • From ₹220 / night
                </div>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
                New
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURED DESTINATION & FLOATING GLASS BOOKING CARD (Signature Element)
          ========================================================================= */}
      <section style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '16px 16px 64px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(24px, 4vw, 48px)',
          alignItems: 'center',
        }}>
          {/* Left Column: Architectural Photo with Floating Frosted Glass Booking Card */}
          <div style={{
            position: 'relative',
            height: 'auto',
            minHeight: 'clamp(480px, 60vh, 560px)',
            borderRadius: 'clamp(20px, 4vw, 32px)',
            overflow: 'hidden',
            backgroundImage: 'url(/images/dest_sydney.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(14px, 3vw, 24px)',
          }}>
            {/* The Floating Translucent Booking Widget */}
            <div
              className="glass-floating"
              style={{
                width: '100%',
                maxWidth: '360px',
                padding: 'clamp(20px, 3vw, 28px) clamp(16px, 2.5vw, 24px)',
                color: '#0f172a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ArrowLeft size={16} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                  Find Stays
                </span>
              </div>

              {/* Check-in & Check-out inputs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Check in</div>
                  <input
                    type="date"
                    value={widgetCheckIn}
                    onChange={(e) => setWidgetCheckIn(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      marginTop: '2px',
                    }}
                  />
                </div>

                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Check out</div>
                  <input
                    type="date"
                    value={widgetCheckOut}
                    onChange={(e) => setWidgetCheckOut(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      marginTop: '2px',
                    }}
                  />
                </div>
              </div>

              {/* Guests and Rooms dropdown */}
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                marginBottom: '18px',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Guest and Rooms</div>
                <select
                  value={widgetGuests}
                  onChange={(e) => setWidgetGuests(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    cursor: 'pointer',
                    marginTop: '2px',
                  }}
                >
                  <option value="1 Adult, 1 Room">1 Adult, 1 Room</option>
                  <option value="2 Adults, 1 Room">2 Adults, 1 Room</option>
                  <option value="4 Adults, 2 Rooms">4 Adults, 2 Rooms</option>
                </select>
              </div>

              {/* Instant Search & Book CTA Button */}
              <button
                onClick={() => onOpenBooking(suiteRoom)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: '#111827',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                  transition: 'background 0.15s ease',
                }}
              >
                Search & Reserve
              </button>
            </div>
          </div>

          {/* Right Column: Sydney Details & Thumbnails from Image */}
          <div>
            {/* Nav arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer',
              }}>
                <ArrowLeft size={16} />
              </div>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer',
              }}>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Destination Title */}
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              margin: '0 0 12px',
            }}>
              Sidney, Australia
            </h2>

            <p style={{
              fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}>
              This newly built one bedroom apartment is your sanctuary away from home.
              You may enjoy the weekly firework of Darling Harbour from your own balcony.
            </p>

            {/* Tags Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '26px' }}>
              {['Tiny homes', 'Camping', 'Beautiful views', 'Amazing pools', '12+'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    background: '#f1f3f7',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 3 Detail Thumbnail Cards from Image */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{
                height: 'clamp(80px, 12vw, 110px)',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundImage: 'url(/images/interior_bedside.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }} />

              <div style={{
                height: 'clamp(80px, 12vw, 110px)',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundImage: 'url(/images/stay_pod.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }} />

              {/* Black rating card */}
              <div style={{
                height: 'clamp(80px, 12vw, 110px)',
                borderRadius: '16px',
                background: '#111827',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              }}>
                <div style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)', fontWeight: 900, lineHeight: 1 }}>
                  4.9
                </div>
                <div style={{ display: 'flex', gap: '2px', marginTop: '3px', marginBottom: '3px' }}>
                  <Star size={10} fill="#eab308" color="#eab308" />
                  <Star size={10} fill="#eab308" color="#eab308" />
                  <Star size={10} fill="#eab308" color="#eab308" />
                  <Star size={10} fill="#eab308" color="#eab308" />
                  <Star size={10} fill="#eab308" color="#eab308" />
                </div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600 }}>
                  Reviews
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. "WEEKLY ITINERARY" SECTION (Matches Bottom Interactive List in Image)
          ========================================================================= */}
      <section style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '16px 16px 60px' }}>
        {/* Title + Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.8vw, 2rem)', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Weekly Itinerary
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setItineraryFilter('best')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                background: itineraryFilter === 'best' ? '#111827' : '#ffffff',
                color: itineraryFilter === 'best' ? '#ffffff' : '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Best one
            </button>
            <button
              onClick={() => setItineraryFilter('rec')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: itineraryFilter === 'rec' ? '#111827' : '#ffffff',
                color: itineraryFilter === 'rec' ? '#ffffff' : '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Recommendation
            </button>
            <button
              onClick={() => setItineraryFilter('popular')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                background: itineraryFilter === 'popular' ? '#111827' : '#ffffff',
                color: itineraryFilter === 'popular' ? '#ffffff' : '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Popular
            </button>
            <button
              onClick={() => setItineraryFilter('cheaper')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
                background: itineraryFilter === 'cheaper' ? '#111827' : '#ffffff',
                color: itineraryFilter === 'cheaper' ? '#ffffff' : '#334155',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cheaper
            </button>
          </div>
        </div>

        {/* Itinerary Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Item 1: Barcelona (Expanded in Image) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            padding: 'clamp(18px, 3vw, 28px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '20px',
              alignItems: 'center',
            }}>
              {/* Left description */}
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Barcelona
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, marginBottom: '18px' }}>
                  Providing a mix of cultural sights, iconic landmarks, authentic food experiences, and vibrant local neighborhoods.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => onOpenBooking(standardRoom)}
                    className="btn-pill-dark"
                    style={{ padding: '8px 22px' }}
                  >
                    <span>Book</span>
                  </button>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                  }}>
                    <Home size={15} />
                  </div>
                </div>
              </div>

              {/* Center Photo */}
              <div style={{
                height: '170px',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundImage: 'url(/images/interior_bedside.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />

              {/* Right Calendar Widget Card */}
              <div style={{
                background: '#111827',
                borderRadius: '20px',
                padding: '18px 20px',
                color: '#ffffff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 900, lineHeight: 1 }}>23</span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>to 26 December</span>
                </div>

                {/* Day Circles with Orange Highlights */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {[
                    { day: 'M', active: false },
                    { day: 'T', active: false },
                    { day: 'W', active: true },
                    { day: 'T', active: true },
                    { day: 'F', active: true },
                    { day: 'S', active: true },
                    { day: 'S', active: false },
                  ].map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: d.active ? '#ea580c' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                      }}
                    >
                      {d.day}
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>
                  4 Days Itinerary
                </div>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {['Cultural', 'Beach View', '12+'].map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: London */}
          <div
            onClick={() => setExpandedCity(expandedCity === 'London' ? '' : 'London')}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              London
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.84rem', fontWeight: 600 }}>
              <span>4 Days Itinerary</span>
              <Plus size={17} />
            </div>
          </div>

          {/* Item 3: Madrid */}
          <div
            onClick={() => setExpandedCity(expandedCity === 'Madrid' ? '' : 'Madrid')}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              Madrid
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.84rem', fontWeight: 600 }}>
              <span>4 Days Itinerary</span>
              <Plus size={17} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. GUEST SELF-SERVICE: FIND MY BOOKING
          ========================================================================= */}
      <section id="lookup" style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: 'clamp(40px, 6vw, 70px) 16px',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>
            Find & Manage Your Booking
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '22px' }}>
            No login needed. Simply enter your Reservation ID or email to view your confirmed room, stay dates, and digital invoice.
          </p>

          <form onSubmit={handleLookupBooking} style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="e.g. RES-1003 or guest@domain.com"
              style={{
                flex: '1 1 200px',
                padding: '12px 18px',
                borderRadius: '9999px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              className="btn-pill-dark"
              style={{ padding: '12px 24px', flex: '0 0 auto' }}
            >
              Verify
            </button>
          </form>

          {lookupError && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}>
              <AlertCircle size={15} />
              <span>{lookupError}</span>
            </div>
          )}

          {foundReservation && (
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #111827',
              borderRadius: '24px',
              padding: 'clamp(16px, 3vw, 24px)',
              textAlign: 'left',
              marginTop: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>Reservation Found</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827' }}>{foundReservation.reservationId}</div>
                </div>
                <span className="badge badge-booked">Status: {foundReservation.status}</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '0.84rem',
              }}>
                <div><strong>Guest:</strong> {foundReservation.customer?.name}</div>
                <div><strong>Room:</strong> Room {foundReservation.room?.roomNumber} ({foundReservation.room?.roomType})</div>
                <div><strong>Check In:</strong> {foundReservation.checkInDate}</div>
                <div><strong>Check Out:</strong> {foundReservation.checkOutDate}</div>
              </div>

              <button
                onClick={() => onViewBill(foundReservation.reservationId)}
                className="btn-pill-dark"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                <FileText size={14} />
                <span>View & Print Itemized Bill</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. GIANT EDITORIAL BRAND FOOTER (Matches Reference Image Exactly)
          ========================================================================= */}
      <footer style={{
        background: '#0a0d14',
        color: '#ffffff',
        padding: 'clamp(40px, 6vw, 70px) clamp(16px, 4vw, 32px) 24px',
        marginTop: 'auto',
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          {/* Top Footer Row */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '44px',
          }}>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                © 2024 Copyright
              </div>
            </div>

            <div style={{ maxWidth: '440px' }}>
              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 16px' }}>
                Uncover hidden gems, unique stays, and unforgettable experiences. With The Oasis, every journey leads to discovery.
              </p>

              <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                <span>X (Twitter)</span>
                <span>•</span>
                <span>Facebook</span>
                <span>•</span>
                <span>LinkedIn</span>
                <span>•</span>
                <span>Youtube</span>
              </div>
            </div>
          </div>

          {/* Giant Brand Typography & Scroll to Top Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{
              fontSize: 'clamp(2.4rem, 10vw, 6.8rem)',
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: '#ffffff',
            }}>
              The Oasis
            </div>

            <button
              onClick={scrollToTop}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: '6px',
                transition: 'background 0.2s',
              }}
              title="Back to top"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
