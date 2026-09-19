import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodayDashboard } from '../components/TodayDashboard';
import { MedicationTask, AppointmentItem, UserPreferences } from '../types';

describe('TodayDashboard Component', () => {
  const mockPreferences: UserPreferences = {
    textSize: 'xl',
    speakAloud: true,
    userName: 'Eleanor',
    userPhone: '(555) 0123',
    caregiverName: 'Sarah (Daughter)',
    caregiverPhone: '(555) 0192',
    caregiverConnected: true,
  };

  const mockMedicationPending: MedicationTask = {
    id: 'med-1',
    title: 'Blood Pressure Pill',
    subtitle: 'Lisinopril 10mg',
    dosage: '1 tablet (10mg)',
    time: '2:00 PM',
    dueInHours: 'In 2 hours',
    instructions: 'Take after lunch with water',
    status: 'pending',
  };

  const mockAppointments: AppointmentItem[] = [
    {
      id: 'appt-1',
      title: 'Dr. Smith Cardiovascular Care',
      doctor: 'Dr. Smith',
      date: 'Thursday, Oct 12',
      time: '10:00 AM',
      clinicNote: 'Do not eat breakfast before coming.',
      rideStatus: 'confirmed',
    },
  ];

  it('renders senior greeting and outlook card', () => {
    render(
      <TodayDashboard
        preferences={mockPreferences}
        medication={mockMedicationPending}
        appointments={mockAppointments}
        onTakeMedication={vi.fn()}
        onOpenScanner={vi.fn()}
      />
    );

    expect(screen.getByText(/Oakridge/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's Outlook/i)).toBeInTheDocument();
    expect(screen.getByText(/Blood Pressure Pill/i)).toBeInTheDocument();
  });

  it('calls onTakeMedication when senior taps I Have Taken This button', () => {
    const handleTakeMed = vi.fn();
    render(
      <TodayDashboard
        preferences={mockPreferences}
        medication={mockMedicationPending}
        appointments={mockAppointments}
        onTakeMedication={handleTakeMed}
        onOpenScanner={vi.fn()}
      />
    );

    const takeButton = screen.getByRole('button', { name: /I Have Taken This/i });
    expect(takeButton).toBeInTheDocument();
    fireEvent.click(takeButton);
    expect(handleTakeMed).toHaveBeenCalledTimes(1);
  });

  it('displays confirmed badge when medication is already taken', () => {
    const mockMedTaken: MedicationTask = {
      ...mockMedicationPending,
      status: 'taken',
      takenTimestamp: '8:15 AM',
    };

    render(
      <TodayDashboard
        preferences={mockPreferences}
        medication={mockMedTaken}
        appointments={mockAppointments}
        onTakeMedication={vi.fn()}
        onOpenScanner={vi.fn()}
      />
    );

    expect(screen.getByText(/Taken & Confirmed/i)).toBeInTheDocument();
  });

  it('navigates to scanner when senior taps appointment card', () => {
    const handleOpenScanner = vi.fn();
    render(
      <TodayDashboard
        preferences={mockPreferences}
        medication={mockMedicationPending}
        appointments={mockAppointments}
        onTakeMedication={vi.fn()}
        onOpenScanner={handleOpenScanner}
      />
    );

    const scanBtn = screen.getByRole('button', { name: /Scan Medical Slip/i });
    expect(scanBtn).toBeInTheDocument();
    fireEvent.click(scanBtn);
    expect(handleOpenScanner).toHaveBeenCalled();
  });
});
