import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssistScanner } from '../components/AssistScanner';
import { UserPreferences } from '../types';

describe('AssistScanner Component', () => {
  const mockPreferences: UserPreferences = {
    textSize: 'xl',
    speakAloud: false,
    userName: 'Eleanor',
    userPhone: '(555) 0123',
    caregiverName: 'Sarah (Daughter)',
    caregiverPhone: '(555) 0192',
    caregiverConnected: true,
  };

  beforeEach(() => {
    // Mock global fetch for /api/scan
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            title: 'Dr. Smith Cardiovascular Consultation',
            doctor: 'Dr. Smith',
            dateTime: 'Thursday, October 12 at 10:00 AM',
            clinicNote: 'Do not eat breakfast before coming.',
            confidence: 99,
            type: 'medical_slip',
          }),
      })
    );
  });

  it('renders scanner title, vision active chip, and sample clinic letter', () => {
    render(
      <AssistScanner
        preferences={mockPreferences}
        onBackHome={vi.fn()}
        onAddToCalendar={vi.fn()}
        onSendToCaregiver={vi.fn()}
      />
    );

    expect(screen.getByText(/VISION AI ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Do not eat breakfast before coming/i)).toBeInTheDocument();
  });

  it('allows switching to pill bottle prescription label', () => {
    render(
      <AssistScanner
        preferences={mockPreferences}
        onBackHome={vi.fn()}
        onAddToCalendar={vi.fn()}
        onSendToCaregiver={vi.fn()}
      />
    );

    const pillTab = screen.getByRole('button', { name: /Pill Bottle/i });
    fireEvent.click(pillTab);

    expect(screen.getAllByText(/Dr. Emily Watson/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Prescription Fill/i).length).toBeGreaterThan(0);
  });

  it('adds verified appointment to calendar after scan and shows confirmation', async () => {
    const handleAddToCalendar = vi.fn();
    render(
      <AssistScanner
        preferences={mockPreferences}
        onBackHome={vi.fn()}
        onAddToCalendar={handleAddToCalendar}
        onSendToCaregiver={vi.fn()}
      />
    );

    const snapBtn = screen.getByRole('button', { name: /SNAP PHOTO/i });
    fireEvent.click(snapBtn);

    await waitFor(() => {
      expect(screen.getByText(/AI Reading Result/i)).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add to My Calendar/i });
    fireEvent.click(addBtn);

    expect(handleAddToCalendar).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Added to Your Calendar!/i)).toBeInTheDocument();
  });

  it('forwards slip to caregiver Sarah after scan and shows sent badge', async () => {
    const handleSendToCaregiver = vi.fn();
    render(
      <AssistScanner
        preferences={mockPreferences}
        onBackHome={vi.fn()}
        onAddToCalendar={vi.fn()}
        onSendToCaregiver={handleSendToCaregiver}
      />
    );

    const snapBtn = screen.getByRole('button', { name: /SNAP PHOTO/i });
    fireEvent.click(snapBtn);

    await waitFor(() => {
      expect(screen.getByText(/AI Reading Result/i)).toBeInTheDocument();
    });

    const sendBtn = screen.getByRole('button', { name: /Send to Sarah/i });
    fireEvent.click(sendBtn);

    expect(handleSendToCaregiver).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Sent!')).toBeInTheDocument();
  });

  it('snaps photo and triggers backend AI scan', async () => {
    render(
      <AssistScanner
        preferences={mockPreferences}
        onBackHome={vi.fn()}
        onAddToCalendar={vi.fn()}
        onSendToCaregiver={vi.fn()}
      />
    );

    const snapBtn = screen.getByRole('button', { name: /SNAP PHOTO/i });
    fireEvent.click(snapBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/scan',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
