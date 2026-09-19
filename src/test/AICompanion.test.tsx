import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AICompanionOverlay } from '../components/AICompanionOverlay';
import { MedicationTask, AppointmentItem } from '../types';

describe('AICompanionOverlay Component', () => {
  const mockMedication: MedicationTask = {
    id: 'med-1',
    title: 'Blood Pressure Pill',
    subtitle: 'Lisinopril 10mg',
    dosage: '1 tablet (10mg)',
    time: '2:00 PM',
    dueInHours: 'Taken',
    instructions: 'Take after lunch with water',
    status: 'taken',
    takenTimestamp: '8:15 AM',
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

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            response: 'Yes, Eleanor! You took your blood pressure medicine this morning at 8:15 AM.',
            spotlightTarget: null,
            source: 'gemini',
          }),
      })
    );
  });

  it('renders overlay when isOpen is true', () => {
    render(
      <AICompanionOverlay
        isOpen={true}
        onClose={vi.fn()}
        currentTab="today"
        medication={mockMedication}
        appointments={mockAppointments}
        onTriggerSpotlight={vi.fn()}
        onNavigateToTab={vi.fn()}
      />
    );

    expect(screen.getByText(/ElderEase Companion/i)).toBeInTheDocument();
    expect(screen.getByText(/Did I take my blood pressure medicine today\?/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AICompanionOverlay
        isOpen={false}
        onClose={vi.fn()}
        currentTab="today"
        medication={mockMedication}
        appointments={mockAppointments}
        onTriggerSpotlight={vi.fn()}
        onNavigateToTab={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('processes selected quick question and displays answer', async () => {
    render(
      <AICompanionOverlay
        isOpen={true}
        onClose={vi.fn()}
        currentTab="today"
        medication={mockMedication}
        appointments={mockAppointments}
        onTriggerSpotlight={vi.fn()}
        onNavigateToTab={vi.fn()}
      />
    );

    const questionBtn = screen.getByRole('button', {
      name: /Did I take my blood pressure medicine today\?/i,
    });
    fireEvent.click(questionBtn);

    await waitFor(() => {
      expect(screen.getByText(/ElderEase Answer/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Yes, Eleanor! You took your blood pressure medicine this morning/i)
      ).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <AICompanionOverlay
        isOpen={true}
        onClose={handleClose}
        currentTab="today"
        medication={mockMedication}
        appointments={mockAppointments}
        onTriggerSpotlight={vi.fn()}
        onNavigateToTab={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Close Assistant/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
