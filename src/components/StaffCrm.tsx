'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

interface Lead {
  id: string;
  reference: string;
  pipelineKey: string;
  stage: string;
  outcome: string;
  enquiryType: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  adults?: number | null;
  children?: number | null;
  message?: string | null;
  departmentKey: string;
  createdAt: string;
}

interface Stats {
  total: number;
  hotel: number;
  restaurant: number;
  spa: number;
  healthClub: number;
  activeOpen: number;
  confirmedWon: number;
}

type DepartmentKey = 'all' | 'hotel' | 'restaurant' | 'spa' | 'health_club';

interface RoleProfile {
  id: string;
  title: string;
  department: DepartmentKey;
  accessName: string;
  badgeColor: string;
}

const ROLE_PROFILES: RoleProfile[] = [
  {
    id: 'gm',
    title: 'General Manager / Executive',
    department: 'all',
    accessName: 'Full Property Master Access',
    badgeColor: 'bg-brand-antique/20 text-brand-bronze-ink border-brand-antique/40',
  },
  {
    id: 'front_desk',
    title: 'Front Desk & Reservations Officer',
    department: 'hotel',
    accessName: 'Hotel & Apartments Management',
    badgeColor: 'bg-blue-500/20 text-blue-700 border-blue-500/40',
  },
  {
    id: 'restaurant_mgr',
    title: 'La Cabana Restaurant Host & Manager',
    department: 'restaurant',
    accessName: 'Dining & Rodizio Reservations',
    badgeColor: 'bg-amber-500/20 text-amber-700 border-amber-500/40',
  },
  {
    id: 'spa_concierge',
    title: 'Calabash Spa & Hammam Concierge',
    department: 'spa',
    accessName: 'Spa Appointments & Wellness Scheduling',
    badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40',
  },
  {
    id: 'fitness_lead',
    title: 'Health Club & Pool Supervisor',
    department: 'health_club',
    accessName: 'Fitness Passes & Pool Deck Operations',
    badgeColor: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/40',
  },
];

function StaffPortalContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    hotel: 0,
    restaurant: 0,
    spa: 0,
    healthClub: 0,
    activeOpen: 0,
    confirmedWon: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentDept, setCurrentDept] = useState<DepartmentKey>('all');
  const [activeRole, setActiveRole] = useState<string>('gm');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/leads');
      const data = await res.json();
      if (data.ok && Array.isArray(data.leads)) {
        setLeads(data.leads);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRoleChange = (roleId: string) => {
    setActiveRole(roleId);
    const profile = ROLE_PROFILES.find((p) => p.id === roleId);
    if (profile && profile.department !== 'all') {
      setCurrentDept(profile.department);
    } else {
      setCurrentDept('all');
    }
  };

  const handleUpdateStage = async (id: string, newStage: string) => {
    setUpdatingId(id);
    try {
      const outcome =
        newStage === 'confirmed' || newStage === 'booked' || newStage === 'completed'
          ? 'won'
          : newStage === 'cancelled'
            ? 'lost'
            : 'open';

      const res = await fetch('/api/staff/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage, outcome }),
      });

      const data = await res.json();
      if (data.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, stage: newStage, outcome } : l)),
        );
        setStatusMessage(`Lead ${id} updated to "${newStage}".`);
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter leads based on active department & search
  const filteredLeads = leads.filter((l) => {
    let matchesDept = true;
    if (currentDept === 'hotel') {
      matchesDept =
        l.departmentKey === 'reservations' ||
        l.enquiryType === 'accommodation' ||
        l.enquiryType === 'long_stay' ||
        l.enquiryType === 'corporate';
    } else if (currentDept === 'restaurant') {
      matchesDept = l.departmentKey === 'dining' || l.enquiryType === 'dining';
    } else if (currentDept === 'spa') {
      matchesDept = l.departmentKey === 'spa' || l.enquiryType === 'spa';
    } else if (currentDept === 'health_club') {
      matchesDept =
        l.departmentKey === 'health_club' ||
        l.enquiryType === 'pool' ||
        l.enquiryType === 'gym' ||
        Boolean(l.enquiryType === 'services' && l.message?.toLowerCase().includes('pass'));
    }

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      l.reference.toLowerCase().includes(term) ||
      l.firstName.toLowerCase().includes(term) ||
      (l.lastName && l.lastName.toLowerCase().includes(term)) ||
      (l.phone && l.phone.includes(term)) ||
      (l.email && l.email.toLowerCase().includes(term)) ||
      (l.message && l.message.toLowerCase().includes(term));

    return matchesDept && matchesSearch;
  });

  const activeProfile = ROLE_PROFILES.find((p) => p.id === activeRole) || ROLE_PROFILES[0];

  return (
    <div className="text-ink-primary font-sans flex flex-col">
      {/* Top Header */}

      {/* Department Navigation Tabs */}
      <div className="bg-surface-raised border-b border-hairline px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentDept('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'all'
                  ? 'bg-brand-bronze-deep text-ink-inverse shadow'
                  : 'text-ink-muted hover:text-ink-primary hover:bg-surface-raised/60'
              }`}
            >
              <span>👑</span>
              <span>All Operations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentDept === 'all' ? 'bg-surface-page text-brand-bronze-ink' : 'bg-surface-raised text-ink-secondary'}`}>
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setCurrentDept('hotel')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'hotel'
                  ? 'bg-blue-600 text-ink-on-scrim shadow'
                  : 'text-ink-muted hover:text-ink-on-scrim hover:bg-surface-raised/60'
              }`}
            >
              <span>🏨</span>
              <span>Hotel & Apartments</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentDept === 'hotel' ? 'bg-white/20 text-ink-primary' : 'bg-surface-raised text-ink-secondary'}`}>
                {stats.hotel}
              </span>
            </button>

            <button
              onClick={() => setCurrentDept('restaurant')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'restaurant'
                  ? 'bg-amber-700 text-ink-on-scrim shadow'
                  : 'text-ink-muted hover:text-ink-on-scrim hover:bg-surface-raised/60'
              }`}
            >
              <span>🍽️</span>
              <span>La Cabana Restaurant</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentDept === 'restaurant' ? 'bg-white/20 text-ink-primary' : 'bg-surface-raised text-ink-secondary'}`}>
                {stats.restaurant}
              </span>
            </button>

            <button
              onClick={() => setCurrentDept('spa')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'spa'
                  ? 'bg-emerald-700 text-ink-on-scrim shadow'
                  : 'text-ink-muted hover:text-ink-on-scrim hover:bg-surface-raised/60'
              }`}
            >
              <span>🧖‍♀️</span>
              <span>Calabash Spa & Salon</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentDept === 'spa' ? 'bg-white/20 text-ink-primary' : 'bg-surface-raised text-ink-secondary'}`}>
                {stats.spa}
              </span>
            </button>

            <button
              onClick={() => setCurrentDept('health_club')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'health_club'
                  ? 'bg-cyan-700 text-ink-on-scrim shadow'
                  : 'text-ink-muted hover:text-ink-on-scrim hover:bg-surface-raised/60'
              }`}
            >
              <span>🏊</span>
              <span>Health Club & Pool</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${currentDept === 'health_club' ? 'bg-white/20 text-ink-primary' : 'bg-surface-raised text-ink-secondary'}`}>
                {stats.healthClub}
              </span>
            </button>
          </div>

          <div className="text-xs text-ink-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Database Online: {leads.length} live records</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statusMessage && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50/70 border border-emerald-600/60 text-emerald-700 text-xs flex items-center justify-between">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-ink-primary">
              ✕
            </button>
          </div>
        )}

        {/* DEPARTMENT-SPECIFIC KPI HERO BANNERS */}
        {currentDept === 'all' && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-between items-end mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-ink-primary">Executive Property Overview</h2>
                <p className="text-xs text-ink-muted">High-level consolidated operations across all 4 hotel facilities.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-surface-raised border border-hairline">
                <span className="text-[10px] uppercase font-semibold text-brand-bronze-ink">Total Cross-Dept Leads</span>
                <div className="text-2xl font-bold text-ink-primary mt-1">{stats.total}</div>
                <div className="text-[10px] text-ink-muted mt-1">{stats.activeOpen} open / awaiting action</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised border border-blue-300/40">
                <span className="text-[10px] uppercase font-semibold text-blue-700">Hotel & Suites</span>
                <div className="text-2xl font-bold text-ink-primary mt-1">{stats.hotel}</div>
                <div className="text-[10px] text-ink-muted mt-1">Short & long stay inquiries</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised border border-amber-300/40">
                <span className="text-[10px] uppercase font-semibold text-amber-700">La Cabana Covers</span>
                <div className="text-2xl font-bold text-ink-primary mt-1">{stats.restaurant}</div>
                <div className="text-[10px] text-ink-muted mt-1">Table dining reservations</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised border border-emerald-300/40">
                <span className="text-[10px] uppercase font-semibold text-emerald-700">Calabash Spa & Hammam</span>
                <div className="text-2xl font-bold text-ink-primary mt-1">{stats.spa}</div>
                <div className="text-[10px] text-ink-muted mt-1">Wellness treatments</div>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised border border-cyan-300/40">
                <span className="text-[10px] uppercase font-semibold text-cyan-700">Health Club & Pool</span>
                <div className="text-2xl font-bold text-ink-primary mt-1">{stats.healthClub}</div>
                <div className="text-[10px] text-ink-muted mt-1">Day passes & fitness memberships</div>
              </div>
            </div>
          </div>
        )}

        {currentDept === 'hotel' && (
          <div className="mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-surface-raised to-surface-page border border-blue-400/50 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏨</span>
                    <h2 className="text-xl font-serif font-bold text-ink-primary">Hotel & Apartments Management Dashboard</h2>
                  </div>
                  <p className="text-xs text-blue-700/80 mt-1">
                    Direct oversight of Studio, 1-Bed, 2-Bed, and Penthouse units, occupancy pipelines, and resident requests.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/256200555000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-ink-on-scrim text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>💬</span> Desk WhatsApp (+256 200 555 000)
                  </a>
                  <Link
                    href="/#suites"
                    className="bg-surface-page hover:bg-surface-raised text-brand-bronze-ink text-xs font-semibold px-3 py-2 rounded-lg border border-brand-antique/30 transition-colors"
                  >
                    View Apartment Specs ↗
                  </Link>
                </div>
              </div>

              {/* Apartment Inventory Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-blue-900/50">
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">1-Bed Deluxe Apartment</div>
                  <div className="text-sm font-bold text-brand-bronze-ink mt-0.5">$180 / night</div>
                  <div className="text-[10px] text-ink-muted">6 total units • 2 Guests</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">1-Bed Superior Apartment</div>
                  <div className="text-sm font-bold text-brand-bronze-ink mt-0.5">$236 / night</div>
                  <div className="text-[10px] text-ink-muted">12 total units • City views</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">2-Bed Superior Apartment</div>
                  <div className="text-sm font-bold text-brand-bronze-ink mt-0.5">$290 / night</div>
                  <div className="text-[10px] text-ink-muted">8 total units • 4 Guests</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Three-Bed Penthouse</div>
                  <div className="text-sm font-bold text-brand-bronze-ink mt-0.5">$480 / night</div>
                  <div className="text-[10px] text-ink-muted">2 units • Private terrace</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDept === 'restaurant' && (
          <div className="mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-surface-raised to-surface-page border border-amber-400/50 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍽️</span>
                    <h2 className="text-xl font-serif font-bold text-ink-primary">La Cabana Restaurant Operations Dashboard</h2>
                  </div>
                  <p className="text-xs text-amber-700/80 mt-1">
                    Table allocations, Brazilian Rodizio bookings, covers count, seating preferences, and in-room dining requests.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/256702711009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-700 hover:bg-amber-600 text-ink-on-scrim text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>💬</span> Restaurant WhatsApp (+256 702 711 009)
                  </a>
                  <Link
                    href="/facilities/dining"
                    className="bg-surface-page hover:bg-surface-raised text-amber-700 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-500/30 transition-colors"
                  >
                    + Book New Table ↗
                  </Link>
                </div>
              </div>

              {/* Seating Zones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-amber-900/50">
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Main Dining AC Hall</div>
                  <div className="text-xs text-amber-700 font-medium mt-0.5">80 Covers Capacity</div>
                  <div className="text-[10px] text-ink-muted">Indoor climate controlled</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Brazilian Rodizio Lounge</div>
                  <div className="text-xs text-amber-700 font-medium mt-0.5">Premium Meat Cuts</div>
                  <div className="text-[10px] text-ink-muted">Churrascaria experience</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Garden Terrace</div>
                  <div className="text-xs text-amber-700 font-medium mt-0.5">Al Fresco Evening Dining</div>
                  <div className="text-[10px] text-ink-muted">Fresh breeze & greenery</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Poolside Pergola</div>
                  <div className="text-xs text-amber-700 font-medium mt-0.5">Cocktails & Sunset Platter</div>
                  <div className="text-[10px] text-ink-muted">Casual outdoor lounge</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDept === 'spa' && (
          <div className="mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-surface-raised to-surface-page border border-emerald-400/50 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧖‍♀️</span>
                    <h2 className="text-xl font-serif font-bold text-ink-primary">Calabash Spa & Salon Appointments Dashboard</h2>
                  </div>
                  <p className="text-xs text-emerald-700/80 mt-1">
                    Full-service appointments schedule, Turkish Hammam session bookings, therapist notes, and guest wellness intake.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/256702711056"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-700 hover:bg-emerald-600 text-ink-on-scrim text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>💬</span> Spa Desk WhatsApp (+256 702 711 056)
                  </a>
                  <Link
                    href="/facilities/spa"
                    className="bg-surface-page hover:bg-surface-raised text-emerald-700 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    + Schedule Appointment ↗
                  </Link>
                </div>
              </div>

              {/* Spa Offerings Quick Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-900/50">
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Turkish Hammam Ritual</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">$60 • 60 mins</div>
                  <div className="text-[10px] text-ink-muted">Authentic steam & scrub</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Deep Tissue Massage</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">$55 • 60 mins</div>
                  <div className="text-[10px] text-ink-muted">Acupressure & tension relief</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Aromatherapy Journey</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">$50 • 60 mins</div>
                  <div className="text-[10px] text-ink-muted">Essential oils relaxation</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Calabash Hair & Nail Salon</div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">From $20</div>
                  <div className="text-[10px] text-ink-muted">Manicure, pedicure, hair styling</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentDept === 'health_club' && (
          <div className="mb-8">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-surface-raised to-surface-page border border-cyan-400/50 mb-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏊</span>
                    <h2 className="text-xl font-serif font-bold text-ink-primary">Health Club & Heated Pool Operations Dashboard</h2>
                  </div>
                  <p className="text-xs text-cyan-700/80 mt-1">
                    Day pass issuance, gym memberships, personal trainer assignments, and pool lounger access monitoring.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/256752711704"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-700 hover:bg-cyan-600 text-ink-on-scrim text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>💬</span> Health Club WhatsApp (+256 752 711 704)
                  </a>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/facilities/pool"
                      className="bg-surface-page hover:bg-surface-raised text-cyan-700 text-xs font-semibold px-2.5 py-2 rounded-lg border border-cyan-500/30 transition-colors"
                    >
                      Pool Pass ↗
                    </Link>
                    <Link
                      href="/facilities/gym"
                      className="bg-surface-page hover:bg-surface-raised text-cyan-700 text-xs font-semibold px-2.5 py-2 rounded-lg border border-cyan-500/30 transition-colors"
                    >
                      Gym Pass ↗
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pass Tiers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-cyan-900/50">
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Pool Day Pass</div>
                  <div className="text-xs text-cyan-700 font-medium mt-0.5">$10 Adult / $5 Child</div>
                  <div className="text-[10px] text-ink-muted">All-day heated outdoor pool</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Gym Day Pass</div>
                  <div className="text-xs text-cyan-700 font-medium mt-0.5">$15 / Day</div>
                  <div className="text-[10px] text-ink-muted">Cardio, weights & steam room</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Personal Training</div>
                  <div className="text-xs text-cyan-700 font-medium mt-0.5">$30 / Session</div>
                  <div className="text-[10px] text-ink-muted">1-on-1 certified trainer</div>
                </div>
                <div className="bg-surface-page/80 p-3 rounded-lg border border-hairline">
                  <div className="text-xs font-semibold text-ink-primary">Monthly Membership</div>
                  <div className="text-xs text-cyan-700 font-medium mt-0.5">$150 / Month</div>
                  <div className="text-[10px] text-ink-muted">Full unlimited access</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-surface-raised rounded-xl border border-hairline shadow-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-hairline flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference, guest name, phone, notes..."
                className="bg-surface-page border border-hairline rounded px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-brand-antique w-72"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-ink-muted hover:text-ink-primary text-xs"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span>
                Showing <strong className="text-ink-primary">{filteredLeads.length}</strong> inquiries in{' '}
                <span className="text-brand-bronze-ink font-semibold">
                  {currentDept === 'all'
                    ? 'All Departments'
                    : currentDept === 'hotel'
                      ? 'Hotel & Apartments'
                      : currentDept === 'restaurant'
                        ? 'La Cabana Restaurant'
                        : currentDept === 'spa'
                          ? 'Calabash Spa & Salon'
                          : 'Health Club & Pool'}
                </span>
              </span>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-ink-muted text-xs">
              Loading department operations records...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-ink-muted">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-sm font-semibold text-ink-primary">No Inquiries Found for this Department</h3>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                No active bookings match this view. Switch departments or submit an inquiry via public facility forms.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-page text-ink-muted uppercase tracking-wider text-[10px] border-b border-hairline">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Guest / Contact</th>
                    <th className="py-3 px-4">Facility / Type</th>
                    <th className="py-3 px-4">Date / Slot</th>
                    <th className="py-3 px-4">Covers / Party</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Details & Notes</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline/60">
                  {filteredLeads.map((lead) => {
                    const isDining = lead.departmentKey === 'dining' || lead.enquiryType === 'dining';
                    const isSpa = lead.departmentKey === 'spa' || lead.enquiryType === 'spa';
                    const isHealth = lead.departmentKey === 'health_club' || lead.enquiryType === 'pool' || lead.enquiryType === 'gym';
                    const isHotel = !isDining && !isSpa && !isHealth;

                    return (
                      <tr key={lead.id} className="hover:bg-surface-raised/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-bronze-ink">
                          {lead.reference}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-ink-primary">
                            {lead.firstName} {lead.lastName || ''}
                          </div>
                          <div className="text-[11px] text-ink-muted font-mono mt-0.5">
                            {lead.phone || 'No phone'}
                          </div>
                          {lead.email && (
                            <div className="text-[10px] text-ink-muted truncate max-w-[140px]">
                              {lead.email}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isDining
                                ? 'bg-amber-50/70 text-amber-700 border-amber-400/50'
                                : isSpa
                                  ? 'bg-emerald-50/70 text-emerald-700 border-emerald-400/50'
                                  : isHealth
                                    ? 'bg-cyan-50/70 text-cyan-700 border-cyan-400/50'
                                    : 'bg-blue-50/70 text-blue-700 border-blue-400/50'
                            }`}
                          >
                            <span>{isDining ? '🍽️' : isSpa ? '🧖‍♀️' : isHealth ? '🏊' : '🏨'}</span>
                            <span className="capitalize">{lead.enquiryType.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-ink-primary font-medium">
                            {lead.checkIn || 'Not specified'}
                          </div>
                          {lead.checkOut && lead.checkOut !== lead.checkIn && (
                            <div className="text-[10px] text-ink-muted">to {lead.checkOut}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-ink-secondary font-semibold">
                            {lead.adults || 1} {isDining ? 'Covers' : 'Guest(s)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={lead.stage}
                            disabled={updatingId === lead.id}
                            onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                            className="bg-surface-page text-xs text-ink-primary border border-hairline rounded px-2 py-1 focus:outline-none focus:border-brand-antique cursor-pointer"
                          >
                            <option value="new">New Request</option>
                            <option value="contacted">Contacted Guest</option>
                            <option value="confirmed">Confirmed / Booked</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-ink-secondary line-clamp-2 text-[11px]">
                            {lead.message || 'No additional notes'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {lead.phone ? (
                              <a
                                href={`https://wa.me/${lead.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${lead.firstName}, this is Speke Apartments Wampewo following up on your ${lead.enquiryType.replace('_', ' ')} inquiry (Ref: ${lead.reference}).`,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-700 text-ink-on-scrim text-[11px] font-semibold px-2 py-1 rounded transition-colors"
                              >
                                <span>💬</span> WhatsApp
                              </a>
                            ) : (
                              <span className="text-ink-muted text-[10px]">No phone</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StaffCrm() {
  return (
    <Suspense fallback={<div className="text-ink-muted p-8">Loading enquiries…</div>}>
      <StaffPortalContent />
    </Suspense>
  );
}
