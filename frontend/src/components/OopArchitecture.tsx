'use client';

import React from 'react';
import { Layers, ShieldCheck, GitFork, Cpu, FileSpreadsheet, Code2, Users } from 'lucide-react';

export default function OopArchitecture() {
  const oopConcepts = [
    {
      title: '1. Encapsulation',
      badge: 'Data Security',
      icon: <ShieldCheck size={22} style={{ color: '#2f65f6' }} />,
      desc: 'All sensitive entity properties (Customer contact info, Room pricing, Reservation dates & states) are declared private. Access is strictly controlled through validated getters and setters to protect internal state from illegal mutations.',
      code: `public class Customer {
    private String id;
    private String name;
    private String email;
    private String phone;
    // Getters and validated setters
}`,
    },
    {
      title: '2. Inheritance',
      badge: 'Code Reusability',
      icon: <GitFork size={22} style={{ color: '#8b5cf6' }} />,
      desc: 'The abstract base class Room encapsulates universal attributes (roomNumber, basePricePerNight, capacity, isAvailable). Subclasses StandardRoom and SuiteRoom inherit these properties while adding specialized features (e.g. jacuzzi, luxury surcharge).',
      code: `public abstract class Room { ... }
public class StandardRoom extends Room { ... }
public class SuiteRoom extends Room {
    private double luxuryServiceFee;
}`,
    },
    {
      title: '3. Polymorphism',
      badge: 'Dynamic Dispatch',
      icon: <Layers size={22} style={{ color: '#f59e0b' }} />,
      desc: 'Subclasses override common methods such as calculateTotalRate(), getTaxRate(), and getDefaultAmenities(). The Hotel service invokes room.calculateTotalRate(nights) polymorphically without needing to know concrete types.',
      code: `@Override
public double calculateTotalRate(long numberOfNights) {
    return (basePricePerNight * nights) + (luxuryServiceFee * nights);
}`,
    },
    {
      title: '4. Abstraction',
      badge: 'Interface Decoupling',
      icon: <Cpu size={22} style={{ color: '#10b981' }} />,
      desc: 'Room provides an abstract blueprint with abstract method signatures, decoupling the high-level reservation and billing management from individual room mechanics.',
      code: `public abstract double calculateTotalRate(long numberOfNights);
public abstract double getTaxRate();
public abstract String getRoomCategoryDescription();`,
    },
    {
      title: '5. Exception Handling',
      badge: 'Fault Tolerance',
      icon: <Code2 size={22} style={{ color: '#ff6584' }} />,
      desc: 'A robust custom exception hierarchy manages edge cases gracefully, providing HTTP REST status codes (400 Bad Request, 404 Not Found, 409 Conflict) and preventing runtime failures.',
      code: `public class HotelException extends Exception { ... }
public class ValidationException extends HotelException { ... }
public class RoomNotAvailableException extends HotelException { ... }
public class ReservationNotFoundException extends HotelException { ... }`,
    },
    {
      title: '6. CSV Persistence Layer',
      badge: 'Data Layer',
      icon: <FileSpreadsheet size={22} style={{ color: '#06b6d4' }} />,
      desc: 'DataManager handles loading and saving reservations, rooms, and customers to persistent CSV files (reservations.csv, rooms.csv, customers.csv), ensuring persistence between application runs.',
      code: `public class DataManager {
    public synchronized void saveReservations(List<Reservation> list);
    public synchronized List<Reservation> loadReservations(...);
}`,
    },
  ];

  const classStructure = [
    { name: 'Customer', purpose: 'Stores guest profile details: unique ID, name, email, and validated phone number.' },
    { name: 'Room', purpose: 'Abstract base class containing common room characteristics and contract methods.' },
    { name: 'StandardRoom', purpose: 'Concrete standard room representation with standard tax rate (10%) and essential amenities.' },
    { name: 'SuiteRoom', purpose: 'Executive suite representation with luxury surcharge, 14% tax rate, and premium amenities.' },
    { name: 'Reservation', purpose: 'Binds Customer, Room, stay dates, unique RES-XXXX ID, and tracks reservation status.' },
    { name: 'Bill', purpose: 'Calculates nights, itemized rates, taxes, and produces formatted text and digital receipts.' },
    { name: 'Hotel', purpose: 'Central controller managing room availability checks, bookings, check-in/out, and statistics.' },
    { name: 'DataManager', purpose: 'Reads and writes records persistently to CSV files with synchronized file locking.' },
    { name: 'Validation', purpose: 'Static validator applying regex for emails, phone numbers, and chronological date sequences.' },
  ];

  return (
    <div>
      {/* Overview Card */}
      <div className="white-card" style={{ padding: '32px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--blue-soft)',
            color: 'var(--blue-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Layers size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-title)' }}>
              Project OOP Architecture & System Design
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Compliant with Project Proposal Specifications • Object-Oriented Programming Using Java
            </p>
          </div>
        </div>

        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '900px' }}>
          This system couples a <strong>Core Java 21 OOP backend</strong> with persistent CSV storage and an embedded HTTP REST server, consumed seamlessly by a high-performance <strong>Next.js</strong> user interface.
        </p>

        {/* Authors */}
        <div style={{
          marginTop: '20px',
          padding: '16px 20px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue-primary)', fontWeight: 800, fontSize: '0.86rem' }}>
            <Users size={18} />
            <span>Group Contributors:</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.84rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-title)' }}>1. Adhwaith AS (Roll 5)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-title)' }}>2. Arjun B (Roll 16)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-title)' }}>3. Martin Job (Roll 35)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-title)' }}>4. Naveen S (Roll 38)</span>
          </div>
        </div>
      </div>

      {/* 6 OOP Concepts Grid */}
      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '18px' }}>
        Core OOP Principles Implemented (Section 9)
      </h4>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '36px',
      }}>
        {oopConcepts.map((item, idx) => (
          <div key={idx} className="white-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.icon}
                <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-title)' }}>{item.title}</h5>
              </div>
              <span className="badge badge-booked">{item.badge}</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              {item.desc}
            </p>
            <pre style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontSize: '0.78rem',
              color: '#0f172a',
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
            }}>
              <code>{item.code}</code>
            </pre>
          </div>
        ))}
      </div>

      {/* Class Table */}
      <div className="white-card" style={{ padding: '28px' }}>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-title)', marginBottom: '6px' }}>
          Proposed Class Structure (Section 8)
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Exact class responsibilities as documented in the proposal report
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px', width: '180px' }}>Class Name</th>
                <th style={{ padding: '12px 14px' }}>Defined Purpose & Responsibility</th>
                <th style={{ padding: '12px 14px', width: '160px' }}>Package Location</th>
              </tr>
            </thead>
            <tbody>
              {classStructure.map((cls, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px', fontWeight: 800, color: 'var(--blue-primary)', fontFamily: 'var(--font-mono)' }}>
                    {cls.name}
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.86rem', color: 'var(--text-main)' }}>
                    {cls.purpose}
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    backend/src/com/hotel/...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
