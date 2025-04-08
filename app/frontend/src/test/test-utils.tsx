import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { 
  AuthProvider, 
  UIProvider, 
  RecipeProvider,
  CategoryProvider,
  TagProvider,
  StatsProvider 
} from '../context';

// All providers wrapper
const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <RecipeProvider>
            <CategoryProvider>
              <TagProvider>
                <StatsProvider>
                  {children}
                </StatsProvider>
              </TagProvider>
            </CategoryProvider>
          </RecipeProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
