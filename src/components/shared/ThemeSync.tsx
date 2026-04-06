import { useEffect } from 'react';
import { useAppSelector } from '@/store';

const ThemeSync: React.FC = () => {
  const darkMode = useAppSelector((s) => s.ui.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.classList.toggle('light', !darkMode);
  }, [darkMode]);

  return null;
};

export default ThemeSync;
