import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

export default function DeepLinkHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = async () => {
      // Parse URL parameters
      const params = new URLSearchParams(location.search);
      const importToken = params.get('token');
      
      // Handle import token
      if (location.pathname === '/import' && importToken) {
        try {
          // Get import data
          const response = await api.get(`/sharing/import/${importToken}`);
          
          if (response.data.success) {
            const importData = response.data.import;
            
            // Check if user is authenticated
            if (!isAuthenticated) {
              // Store token in session storage and redirect to login
              sessionStorage.setItem('pendingImportToken', importToken);
              navigate('/login?redirect=/import');
              return;
            }
            
            // Navigate to import page with URL and source
            navigate(`/app/import?url=${encodeURIComponent(importData.params.url)}&source=${importData.params.source}`);
            
            // Delete the pending import
            await api.delete(`/sharing/import/${importToken}`);
          }
        } catch (error) {
          console.error('Error handling import deep link:', error);
          navigate('/app/recipes');
        }
      }
      
      // Handle shared recipe token
      if (location.pathname.startsWith('/shared/') && location.pathname.length > 8) {
        const token = location.pathname.substring(8);
        
        try {
          // Get shared recipe
          const response = await api.get(`/sharing/shared/${token}`);
          
          if (response.data.success) {
            // If user is authenticated, navigate to the recipe
            if (isAuthenticated && response.data.recipe) {
              navigate(`/app/recipes/${response.data.recipe.id}`);
            }
            // Otherwise, stay on the shared page
          }
        } catch (error) {
          console.error('Error handling shared recipe deep link:', error);
          navigate('/');
        }
      }
      
      // Check for pending import after login
      if (isAuthenticated && location.pathname === '/app/recipes') {
        const pendingImportToken = sessionStorage.getItem('pendingImportToken');
        
        if (pendingImportToken) {
          // Clear the pending import token
          sessionStorage.removeItem('pendingImportToken');
          
          try {
            // Get import data
            const response = await api.get(`/sharing/import/${pendingImportToken}`);
            
            if (response.data.success) {
              const importData = response.data.import;
              
              // Navigate to import page with URL and source
              navigate(`/app/import?url=${encodeURIComponent(importData.params.url)}&source=${importData.params.source}`);
              
              // Delete the pending import
              await api.delete(`/sharing/import/${pendingImportToken}`);
            }
          } catch (error) {
            console.error('Error handling pending import:', error);
          }
        }
      }
    };
    
    handleDeepLink();
  }, [location, isAuthenticated, navigate]);

  // This component doesn't render anything
  return null;
}
