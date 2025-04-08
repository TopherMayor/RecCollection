import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagCloud } from './TagCloud';
import { BrowserRouter } from 'react-router-dom';

// Mock the useTags hook
vi.mock('../../context/TagContext', () => ({
  useTags: () => ({
    popularTags: [
      { id: 1, name: 'tag1', count: 40 },
      { id: 2, name: 'tag2', count: 30 },
      { id: 3, name: 'tag3', count: 20 },
    ],
    loading: false,
    error: null,
    fetchPopularTags: vi.fn(),
  }),
}));

describe('TagCloud', () => {
  it('should render the component with default title', () => {
    render(
      <BrowserRouter>
        <TagCloud />
      </BrowserRouter>
    );
    
    // Check if the title is displayed
    expect(screen.getByText('Popular Tags')).toBeInTheDocument();
  });
  
  it('should render the component with custom title', () => {
    render(
      <BrowserRouter>
        <TagCloud title="Custom Title" />
      </BrowserRouter>
    );
    
    // Check if the custom title is displayed
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
  
  it('should render tags', () => {
    render(
      <BrowserRouter>
        <TagCloud />
      </BrowserRouter>
    );
    
    // Check if tags are displayed
    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
    expect(screen.getByText('#tag3')).toBeInTheDocument();
  });
  
  it('should limit the number of tags displayed', () => {
    render(
      <BrowserRouter>
        <TagCloud limit={2} />
      </BrowserRouter>
    );
    
    // Check if only the first 2 tags are displayed
    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
    expect(screen.queryByText('#tag3')).not.toBeInTheDocument();
    
    // Check if "View all tags" link is displayed
    expect(screen.getByText('View all tags')).toBeInTheDocument();
  });
});
