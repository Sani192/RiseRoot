import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TodayOverview } from '@/components/today/today-overview';

describe('TodayOverview interactions', () => {
  it('updates progress when completing a task', () => {
    render(<TodayOverview />);

    expect(screen.getByText(/1\/3 complete/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ten-minute outside walk/i }));

    expect(screen.getByText(/2\/3 complete/i)).toBeInTheDocument();
  });

  it('lets user select mood and energy options', () => {
    render(<TodayOverview />);

    const bright = screen.getByRole('button', { name: 'Bright' });
    const high = screen.getByRole('button', { name: 'High' });

    fireEvent.click(bright);
    fireEvent.click(high);

    expect(bright).toHaveClass('bg-primary');
    expect(high).toHaveClass('bg-primary');
  });
});
