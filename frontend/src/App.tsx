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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<Suspense fallback={<PageLoader />}><HowItWorksPage /></Suspense>} />
          <Route path="/safety-center" element={<Suspense fallback={<PageLoader />}><SafetyCenterPage /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<PageLoader />}><AboutPage /></Suspense>} />
        
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
            <Route path="/analyze" element={<Suspense fallback={<PageLoader />}><AnalyzerPage /></Suspense>} />
            <Route path="/history" element={<Suspense fallback={<PageLoader />}><HistoryPage /></Suspense>} />
            <Route path="/threat-intel" element={<Suspense fallback={<PageLoader />}><ThreatIntelPage /></Suspense>} />
            <Route path="/reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
            <Route path="/password-checker" element={<Suspense fallback={<PageLoader />}><PasswordCheckerPage /></Suspense>} />
            <Route path="/scanner" element={<Suspense fallback={<PageLoader />}><PortScannerPage /></Suspense>} />
            <Route path="/honeypot" element={<Suspense fallback={<PageLoader />}><HoneypotPage /></Suspense>} />
            <Route path="/vault" element={<Suspense fallback={<PageLoader />}><SecureVaultPage /></Suspense>} />
            {/* Phase 11: Pro Labs */}
            <Route path="/analyze/email" element={<Suspense fallback={<PageLoader />}><EmailAnalyzerPage /></Suspense>} />
            <Route path="/analyze/qr" element={<Suspense fallback={<PageLoader />}><QRScannerPage /></Suspense>} />
            <Route path="/monitor/darkweb" element={<Suspense fallback={<PageLoader />}><DarkWebMonitorPage /></Suspense>} />
            <Route path="/copilot" element={<Suspense fallback={<PageLoader />}><CyberCopilotPage /></Suspense>} />
          </Route>
        </Routes>
    </>
  );
}

export default App;

