import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmergencySOS } from '../components/EmergencySOS';
import { UserPreferences } from '../types';

describe('EmergencySOS Component', () => {
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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders 10-second countdown and false-alarm cancel button', () => {
    render(
      <EmergencySOS
        preferences={mockPreferences}
        onCancelEmergency={vi.fn()}
        onDispatchTriggered={vi.fn()}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CANCEL EMERGENCY/i })).toBeInTheDocument();
  });

  it('counts down each second', () => {
    render(
      <EmergencySOS
        preferences={mockPreferences}
        onCancelEmergency={vi.fn()}
        onDispatchTriggered={vi.fn()}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('09')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('08')).toBeInTheDocument();
  });

  it('cancels emergency and calls onCancelEmergency after user clicks CANCEL EMERGENCY', () => {
    const handleCancel = vi.fn();
    render(
      <EmergencySOS
        preferences={mockPreferences}
        onCancelEmergency={handleCancel}
        onDispatchTriggered={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /CANCEL EMERGENCY/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByText(/EMERGENCY CANCELED/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(handleCancel).toHaveBeenCalled();
  });

  it('triggers dispatch when countdown reaches zero', () => {
    const handleDispatch = vi.fn();
    render(
      <EmergencySOS
        preferences={mockPreferences}
        onCancelEmergency={vi.fn()}
        onDispatchTriggered={handleDispatch}
      />
    );

    for (let i = 0; i < 11; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(handleDispatch).toHaveBeenCalled();
    expect(screen.getByText(/HELP IS ON THE WAY/i)).toBeInTheDocument();
  });
});
