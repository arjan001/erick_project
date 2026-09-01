import { useState, useEffect } from 'react';

// Translation hook - will fetch from Translation entity in production
export function useTranslation() {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const savedLang = localStorage.getItem('ericrabar_language') || 'en';
    setLang(savedLang);
    
    // In production, fetch from Translation entity
    // For now, using inline translations
    setTranslations(getStaticTranslations(savedLang));
  }, []);

  const t = (key) => {
    return translations[key] || key;
  };

  return { t, lang };
}

// Static translations - will be replaced by entity data
function getStaticTranslations(lang) {
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.work': 'Work',
      'nav.services': 'Services',
      'nav.first_frame': 'First Frame',
      'nav.pricing': 'Pricing',
      'nav.submit': 'Submit Project',
      'nav.apply_artist': 'Apply as Artist',
      'nav.apply_team': 'Apply as Team',
      'nav.contact': 'Contact',
      'hero.title': 'Production Excellence',
      'hero.subtitle': 'We assemble world-class teams for commercial, film, and creative productions across Europe',
      'hero.cta': 'Start a Production',
      'footer.rights': 'Eric Rabar. All rights reserved.',
    },
    nl: {
      'nav.home': 'Home',
      'nav.work': 'Werk',
      'nav.services': 'Diensten',
      'nav.first_frame': 'First Frame',
      'nav.pricing': 'Prijzen',
      'nav.submit': 'Project Indienen',
      'nav.apply_artist': 'Aanmelden als Artist',
      'nav.apply_team': 'Aanmelden als Team',
      'nav.contact': 'Contact',
      'hero.title': 'Productie Excellence',
      'hero.subtitle': 'Wij stellen wereldklasse teams samen voor commerciële, film en creatieve producties in heel Europa',
      'hero.cta': 'Start een Productie',
      'footer.rights': 'Eric Rabar. Alle rechten voorbehouden.',
    },
    es: {
      'nav.home': 'Inicio',
      'nav.work': 'Trabajo',
      'nav.services': 'Servicios',
      'nav.first_frame': 'First Frame',
      'nav.pricing': 'Precios',
      'nav.submit': 'Enviar Proyecto',
      'nav.apply_artist': 'Aplicar como Artista',
      'nav.apply_team': 'Aplicar como Equipo',
      'nav.contact': 'Contacto',
      'hero.title': 'Excelencia en Producción',
      'hero.subtitle': 'Reunimos equipos de clase mundial para producciones comerciales, cinematográficas y creativas en toda Europa',
      'hero.cta': 'Iniciar una Producción',
      'footer.rights': 'Eric Rabar. Todos los derechos reservados.',
    }
  };

  return translations[lang] || translations.en;
}