import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid3X3, X, ChevronUp } from 'lucide-react';
import { NAV_ITEMS } from '../navigation/navItems';

const MOBILE_VISIBLE_COUNT = 4;

export function MobileNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const [showAll, setShowAll] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setNavVisible(false);
        setShowAll(false);
      } else {
        setNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const visibleItems = NAV_ITEMS.slice(0, MOBILE_VISIBLE_COUNT);
  const hiddenItems = NAV_ITEMS.slice(MOBILE_VISIBLE_COUNT);

  const isMoreActive = hiddenItems.some((item) =>
    item.end ? location.pathname === item.path : location.pathname.startsWith(item.path),
  );

  return (
    <>
      {/* ===== BOTTOM NAV BAR ===== */}
      <nav
        aria-label={t('nav.ariaLabel')}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface transition-transform duration-300 ease-in-out md:hidden ${
          navVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar — klik untuk toggle hide/show */}
        <div
          className="flex w-full cursor-pointer items-center justify-center py-1.5"
          onClick={() => setNavVisible((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setNavVisible((v) => !v)}
          aria-label="Toggle navigasi"
        >
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>

        <div className="grid grid-cols-5 pb-safe">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setShowAll(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate max-w-[60px]">{t(item.labelKey)}</span>
            </NavLink>
          ))}

          {/* Tombol Lainnya */}
          {hiddenItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 ${
                showAll || isMoreActive ? 'text-primary' : 'text-muted'
              }`}
            >
              {showAll ? <X className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              <span>{showAll ? t('common.close') || 'Tutup' : t('nav.more') || 'Lainnya'}</span>
            </button>
          )}
        </div>
      </nav>

      {/* Tombol floating saat navbar tersembunyi */}
      {!navVisible && (
        <button
          type="button"
          onClick={() => setNavVisible(true)}
          className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
          aria-label="Tampilkan navigasi"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}

      {/* Overlay semua menu */}
      {showAll && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAll(false)} />
          <div className="absolute bottom-14 left-2 right-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-xl scrollbar-hide">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t('nav.allMenu') || 'Semua Menu'}
              </span>
              <button type="button" onClick={() => setShowAll(false)} className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setShowAll(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-background hover:text-ink'
                    }`}
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="truncate max-w-[80px]">{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}