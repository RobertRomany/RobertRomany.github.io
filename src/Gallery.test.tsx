// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Gallery from './Gallery';

afterEach(cleanup);
describe('Gallery', () => {
  it('renders one frame per screen with accessible arrows', () => {
    const { container } = render(<Gallery title="Demo" screens={['/a.webp', '/b.webp', '/c.webp']} />);
    expect(container.querySelectorAll('.phone').length).toBe(3);
    expect(screen.getByRole('button', { name: 'Next screen' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Previous screen' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('hides the arrows for a single screen', () => {
    render(<Gallery title="Demo" screens={['/a.webp']} />);
    expect(screen.queryByRole('button', { name: 'Next screen' })).toBeNull();
  });
});
