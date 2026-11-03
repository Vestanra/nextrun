// HashRouter (not BrowserRouter): GitHub Pages has no server-side routing,
// so deep links like /events/:id/checkout would 404 on refresh. Hash routing
// keeps every route client-side while the app is served from the domain root.
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import Listing from '@/pages/Listing/Listing';
import Details from '@/pages/Details/Details';
import Checkout from '@/pages/Checkout/Checkout';
import Confirmation from '@/pages/Confirmation/Confirmation';
import NotFound from '@/pages/NotFound/NotFound';

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Listing />} />
          <Route path="/events/:id" element={<Details />} />
          <Route path="/events/:id/checkout" element={<Checkout />} />
          <Route path="/events/:id/confirmation/:participantId" element={<Confirmation />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
}
