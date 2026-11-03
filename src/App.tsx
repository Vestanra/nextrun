// BrowserRouter provides crawlable URLs. The production build generates real
// GitHub Pages entry points for public routes plus a 404 SPA fallback.
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import PageMeta from '@/components/PageMeta/PageMeta';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';
import Listing from '@/pages/Listing/Listing';
import Details from '@/pages/Details/Details';
import Checkout from '@/pages/Checkout/Checkout';
import Confirmation from '@/pages/Confirmation/Confirmation';
import NotFound from '@/pages/NotFound/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <PageMeta />
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
    </BrowserRouter>
  );
}
