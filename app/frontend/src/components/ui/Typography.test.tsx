import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography Component', () => {
  it('renders with default props', () => {
    render(<Typography>Typography Content</Typography>);
    const element = screen.getByText('Typography Content');
    expect(element).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Typography className="custom-class">Typography Content</Typography>);
    const element = screen.getByText('Typography Content');
    expect(element.parentElement).toHaveClass('custom-class');
  });
});
