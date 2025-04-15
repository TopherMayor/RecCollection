import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveButton } from './ResponsiveButton';

describe('ResponsiveButton Component', () => {
  it('renders with default props', () => {
    render(<ResponsiveButton>ResponsiveButton Content</ResponsiveButton>);
    const element = screen.getByText('ResponsiveButton Content');
    expect(element).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ResponsiveButton className="custom-class">ResponsiveButton Content</ResponsiveButton>);
    const element = screen.getByText('ResponsiveButton Content');
    expect(element.parentElement).toHaveClass('custom-class');
  });
});
