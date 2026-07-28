import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router's <Routes> (this app is not a data router, so <ScrollRestoration>
// is unavailable) does not reset scroll on navigation. Without this, a deep page
// like Confirmation — reached after a long Checkout form the user scrolled down —
// opens already scrolled down. Reset to top whenever the path changes.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
