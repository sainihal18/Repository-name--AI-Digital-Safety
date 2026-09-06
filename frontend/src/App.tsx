import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import CmdK from './components/CmdK';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ThreatIntelPage = lazy(() => import('./pages/ThreatIntelPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const SafetyCenterPage = lazy(() => import('./pages/SafetyCenterPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const PasswordCheckerPage = lazy(() => import('./pages/PasswordCheckerPage'));
const PortScannerPage = lazy(() => import('./pages/PortScannerPage'));
const HoneypotPage = lazy(() => import('./pages/HoneypotPage'));
const SecureVaultPage = lazy(() => import('./pages/SecureVaultPage'));
const EmailAnalyzerPage = lazy(() => import('./pages/EmailAnalyzerPage'));
const QRScannerPage = lazy(() => import('./pages/QRScannerPage'));
const DarkWebMonitorPage = lazy(() => import('./pages/DarkWebMonitorPage'));
const CyberCopilotPage = lazy(() => import('./pages/CyberCopilotPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function App() {
  return (
    <>
      <CmdK />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/safety-center" element={<SafetyCenterPage />} />
          <Route path="/about" element={<AboutPage />} />
        
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzerPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/threat-intel" element={<ThreatIntelPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/password-checker" element={<PasswordCheckerPage />} />
            <Route path="/scanner" element={<PortScannerPage />} />
            <Route path="/honeypot" element={<HoneypotPage />} />
            <Route path="/vault" element={<SecureVaultPage />} />
            {/* Phase 11: Pro Labs */}
            <Route path="/analyze/email" element={<EmailAnalyzerPage />} />
            <Route path="/analyze/qr" element={<QRScannerPage />} />
            <Route path="/monitor/darkweb" element={<DarkWebMonitorPage />} />
            <Route path="/copilot" element={<CyberCopilotPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

