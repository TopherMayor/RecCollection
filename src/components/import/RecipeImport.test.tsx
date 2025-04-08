import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipeImport } from './RecipeImport';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { importService } from '../../api/import';

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the import service
vi.mock('../../api/import', () => ({
  importService: {
    importFromInstagram: vi.fn(),
    importFromTikTok: vi.fn()
  }
}));

// Mock the useUI hook
vi.mock('../../context/UIContext', () => ({
  useUI: () => ({
    showToast: mockShowToast
  })
}));

// Mock variables
const mockNavigate = vi.fn();
const mockShowToast = vi.fn();

describe('RecipeImport', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockShowToast.mockReset();
    vi.mocked(importService.importFromInstagram).mockReset();
    vi.mocked(importService.importFromTikTok).mockReset();
  });
  
  it('renders import form correctly', () => {
    render(
      <BrowserRouter>
        <RecipeImport />
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Import Recipe')).toBeInTheDocument();
    
    // Check if source options are displayed
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('TikTok')).toBeInTheDocument();
    
    // Check if URL input is displayed
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    
    // Check if import button is displayed
    expect(screen.getByText('Import Recipe')).toBeInTheDocument();
    
    // Check if note is displayed
    expect(screen.getByText(/This will attempt to extract recipe information/)).toBeInTheDocument();
  });
  
  it('shows validation error when URL is empty', async () => {
    render(
      <BrowserRouter>
        <RecipeImport />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Submit the form without entering a URL
    await user.click(screen.getByText('Import Recipe'));
    
    // Check if error message is displayed
    expect(screen.getByText('Please enter a URL')).toBeInTheDocument();
  });
  
  it('imports recipe from Instagram when form is submitted', async () => {
    // Mock successful import
    vi.mocked(importService.importFromInstagram).mockResolvedValue({
      data: {
        recipe: {
          id: 1,
          title: 'Imported Recipe'
        }
      },
      status: 200,
      error: null
    });
    
    render(
      <BrowserRouter>
        <RecipeImport />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Enter URL
    await user.type(screen.getByLabelText('URL'), 'https://www.instagram.com/p/123456/');
    
    // Submit the form
    await user.click(screen.getByText('Import Recipe'));
    
    // Check if importFromInstagram was called with the correct URL
    expect(importService.importFromInstagram).toHaveBeenCalledWith('https://www.instagram.com/p/123456/');
    
    // Check if success toast was shown
    expect(mockShowToast).toHaveBeenCalledWith('Recipe imported successfully!', 'success');
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/1');
  });
  
  it('imports recipe from TikTok when form is submitted', async () => {
    // Mock successful import
    vi.mocked(importService.importFromTikTok).mockResolvedValue({
      data: {
        recipe: {
          id: 2,
          title: 'Imported Recipe'
        }
      },
      status: 200,
      error: null
    });
    
    render(
      <BrowserRouter>
        <RecipeImport />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Select TikTok
    await user.click(screen.getByLabelText('TikTok'));
    
    // Enter URL
    await user.type(screen.getByLabelText('URL'), 'https://www.tiktok.com/@user/video/123456');
    
    // Submit the form
    await user.click(screen.getByText('Import Recipe'));
    
    // Check if importFromTikTok was called with the correct URL
    expect(importService.importFromTikTok).toHaveBeenCalledWith('https://www.tiktok.com/@user/video/123456');
    
    // Check if success toast was shown
    expect(mockShowToast).toHaveBeenCalledWith('Recipe imported successfully!', 'success');
    
    // Check if navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/2');
  });
  
  it('shows error when import fails', async () => {
    // Mock failed import
    vi.mocked(importService.importFromInstagram).mockResolvedValue({
      data: null,
      status: 400,
      error: 'Failed to import recipe'
    });
    
    render(
      <BrowserRouter>
        <RecipeImport />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Enter URL
    await user.type(screen.getByLabelText('URL'), 'https://www.instagram.com/p/123456/');
    
    // Submit the form
    await user.click(screen.getByText('Import Recipe'));
    
    // Check if error message is displayed
    expect(screen.getByText('Failed to import recipe')).toBeInTheDocument();
    
    // Check if error toast was shown
    expect(mockShowToast).toHaveBeenCalledWith('Failed to import recipe', 'error');
    
    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('handles unexpected errors', async () => {
    // Mock unexpected error
    vi.mocked(importService.importFromInstagram).mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <RecipeImport />
      </BrowserRouter>
    );
    
    const user = userEvent.setup();
    
    // Enter URL
    await user.type(screen.getByLabelText('URL'), 'https://www.instagram.com/p/123456/');
    
    // Submit the form
    await user.click(screen.getByText('Import Recipe'));
    
    // Check if error message is displayed
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    
    // Check if error toast was shown
    expect(mockShowToast).toHaveBeenCalledWith('An unexpected error occurred', 'error');
    
    // Check that navigation did not occur
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
