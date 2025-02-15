import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import App from './App';

// Get the container element and initial page from WordPress
const container = document.getElementById('wd-appointments-admin-app');
const page = container?.dataset?.page || 'dashboard';

// Create root and render app
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/wp-admin/admin.php">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <App initialPage={page} />
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Handle WordPress admin menu highlighting
const highlightAdminMenu = () => {
  const menuRoot = document.getElementById('toplevel_page_wd-appointments');
  if (!menuRoot) return;

  // Remove current highlighting
  const currentMenuItems = document.querySelectorAll('.current');
  currentMenuItems.forEach(item => {
    item.classList.remove('current');
  });

  // Add highlighting based on current page
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const page = searchParams.get('page');

  if (page?.startsWith('wd-appointments')) {
    menuRoot.classList.add('wp-has-current-submenu', 'wp-menu-open');
    menuRoot.classList.remove('wp-not-current-submenu');

    // Find and highlight the correct submenu item
    const submenuItems = menuRoot.querySelectorAll('.wp-submenu li');
    submenuItems.forEach(item => {
      const link = item.querySelector('a');
      if (link?.href.includes(page)) {
        item.classList.add('current');
      }
    });
  }
};

// Listen for route changes to update menu highlighting
window.addEventListener('popstate', highlightAdminMenu);
highlightAdminMenu();

// Handle WordPress admin notices
const handleAdminNotices = () => {
  const notices = document.querySelectorAll('.notice:not(.wd-appointments-notice)');
  notices.forEach(notice => {
    // Move notices into our app container if they're related to our plugin
    if (notice.textContent.toLowerCase().includes('wd appointments')) {
      const noticesContainer = document.createElement('div');
      noticesContainer.className = 'wd-appointments-notices';
      container.parentNode.insertBefore(noticesContainer, container);
      noticesContainer.appendChild(notice);
    }
  });
};

// Handle notices when DOM changes
const observer = new MutationObserver(handleAdminNotices);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
handleAdminNotices();

// Cleanup function
window.addEventListener('beforeunload', () => {
  observer.disconnect();
  window.removeEventListener('popstate', highlightAdminMenu);
});

// Export for testing
export const __TEST__ = {
  highlightAdminMenu,
  handleAdminNotices
};
