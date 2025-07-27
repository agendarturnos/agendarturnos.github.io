import React from 'react';
import ServiceListScreen from '../components/ServiceListScreen';
import ServiceSummaryScreen from '../components/ServiceSummaryScreen';
import StylistSelectionScreen from '../components/StylistSelectionScreen';
import { Routes, Route } from 'react-router-dom';

export default function ClientRouter() {
  return (
    <Routes>
      <Route path="/" element={<ServiceListScreen />} />
      <Route path="summary" element={<ServiceSummaryScreen />} />
      <Route path="stylists" element={<StylistSelectionScreen />} />
    </Routes>
  );
}
