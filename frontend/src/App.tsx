import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import MobileLayout from './components/MobileLayout';
import WebLayout from './components/WebLayout';

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? (
    <Routes>
      <Route path="/*" element={<MobileLayout />} />
    </Routes>
  ) : (
    <Routes>
      <Route path="/*" element={<WebLayout />} />
    </Routes>
  );
}

export default App;