import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';

describe('Card Components', () => {
  it('should render Card with children', () => {
    render(
      <Card>
        <div data-testid="card-content">Card Content</div>
      </Card>
    );
    
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });
  
  it('should render CardHeader with children', () => {
    render(
      <CardHeader>
        <div data-testid="header-content">Header Content</div>
      </CardHeader>
    );
    
    expect(screen.getByTestId('header-content')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });
  
  it('should render CardContent with children', () => {
    render(
      <CardContent>
        <div data-testid="content">Content</div>
      </CardContent>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('should render CardFooter with children', () => {
    render(
      <CardFooter>
        <div data-testid="footer-content">Footer Content</div>
      </CardFooter>
    );
    
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });
  
  it('should render a complete card with all components', () => {
    render(
      <Card>
        <CardHeader>
          <h2 data-testid="header">Card Title</h2>
        </CardHeader>
        <CardContent>
          <p data-testid="content">Card Content</p>
        </CardContent>
        <CardFooter>
          <button data-testid="footer">Action</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
