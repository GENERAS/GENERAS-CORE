import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ServiceQuoteForm from '../components/service/ServiceQuoteForm';
import { NEED_BY_KEY } from '../components/service/serviceNeeds';

// A quote request is a business enquiry, so it goes into service_quotes.
// That table is kept separate from project_inquiries on purpose: the admin can
// then tell a "Get Quote" click apart from a "Hire Me" one at a glance.
export default function GetQuotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const serviceId = searchParams.get('service') || '';
  const serviceName = searchParams.get('service_name') || '';
  const needKey = searchParams.get('need') || '';

  const need = needKey ? NEED_BY_KEY[needKey] : undefined;

  // service_quotes.service_id is a BIGINT that points at a row in `services`.
  // The URL carries a pricing-page category id instead, which is text, so it
  // must never be stored there or the insert fails with 22P02. Look up the real
  // row and fall back to an id-less one so a quote is never lost.
  const [service, setService] = useState(null);
  const [ready, setReady] = useState(!serviceId && !serviceName);

  useEffect(() => {
    if (!serviceId && !serviceName) return undefined;

    let active = true;

    (async () => {
      let row = null;

      if (serviceId) {
        const { data } = await supabase
          .from('services')
          .select('id, title, slug, price_hourly, timeline')
          .eq('slug', serviceId)
          .maybeSingle();
        row = data || null;
      }

      if (!row && serviceName) {
        const { data } = await supabase
          .from('services')
          .select('id, title, slug, price_hourly, timeline')
          .eq('title', serviceName)
          .maybeSingle();
        row = data || null;
      }

      if (!active) return;
      setService(row || { id: null, slug: null, title: serviceName || serviceId });
      setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [serviceId, serviceName]);

  if (!ready) return null;

  return (
    <ServiceQuoteForm
      open
      onClose={() => navigate('/business')}
      service={service}
      need={need}
    />
  );
}