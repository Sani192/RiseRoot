import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NotesPage from '@/app/notes/page';

describe('NotesPage editing', () => {
  it('allows editing freeform notes', () => {
    render(<NotesPage />);

    const noteInput = screen.getByPlaceholderText(/Write anything that should stay with this day/i);

    fireEvent.change(noteInput, { target: { value: 'Today I felt steady and focused.' } });

    expect(noteInput).toHaveValue('Today I felt steady and focused.');
  });
});
