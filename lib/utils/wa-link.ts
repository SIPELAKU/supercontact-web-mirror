import { NO_WA } from '../constants/constants';

export const getWhatsAppLink = (pathname: string): string => {
  let message = "Halo, saya tertarik dengan layanan Smartsales.";

  if (pathname.includes('/produk/crm-sales')) {
    message = "Halo, saya tertarik untuk mencoba CRM Sales di Smartsales.";
  } else if (pathname.includes('/produk/crm-services')) {
    message = "Halo, saya tertarik untuk mencoba CRM Services di Smartsales.";
  } else if (pathname.includes('/produk/omnichannel')) {
    message = "Halo, saya tertarik untuk mencoba layanan Omnichannel di Smartsales.";
  } else if (pathname.includes('/produk/ticket')) {
    message = "Halo, saya tertarik untuk mencoba fitur Ticket Creation di Smartsales.";
  } else if (pathname.includes('/solusi/keuangan')) {
    message = "Halo, saya tertarik untuk mencoba solusi Keuangan di Smartsales.";
  } else if (pathname.includes('/solusi/tour-travel')) {
    message = "Halo, saya tertarik untuk mencoba solusi Tour & Travel di Smartsales.";
  } else if (pathname.includes('/solusi/perhotelan')) {
    message = "Halo, saya tertarik untuk mencoba solusi Perhotelan di Smartsales.";
  } else if (pathname.includes('/solusi/logistik')) {
    message = "Halo, saya tertarik untuk mencoba solusi Logistik di Smartsales.";
  } else if (pathname.includes('/solusi/fmcg')) {
    message = "Halo, saya tertarik untuk mencoba solusi FMCG di Smartsales.";
  } else if (pathname.includes('/solusi/ritel')) {
    message = "Halo, saya tertarik untuk mencoba solusi Ritel di Smartsales.";
  } else if (pathname.includes('/solusi/outsourcing')) {
    message = "Halo, saya tertarik untuk mencoba solusi Outsourcing di Smartsales.";
  } else if (pathname.includes('/solusi/it-saas')) {
    message = "Halo, saya tertarik untuk mencoba solusi IT & SaaS di Smartsales.";
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${NO_WA.replace('+', '')}?text=${encodedMessage}`;
};
