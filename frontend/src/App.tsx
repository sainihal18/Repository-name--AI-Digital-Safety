import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import AnalyzerPage from './pages/AnalyzerPage';
import HistoryPage from './pages/HistoryPage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SafetyCenterPage from './pages/SafetyCenterPage';
import AboutPage from './pages/AboutPage';
import ReportsPage from './pages/ReportsPage';
import PasswordCheckerPage from './pages/PasswordCheckerPage';
import PortScannerPage from './pages/PortScannerPage';
import HoneypotPage from './pages/HoneypotPage';
import SecureVaultPage from './pages/SecureVaultPage';
import EmailAnalyzerPage from './pages/EmailAnalyzerPage';
import QRScannerPage from './pages/QRScannerPage';
import DarkWebMonitorPage from './pages/DarkWebMonitorPage';
import CyberCopilotPage from './pages/CyberCopilotPage';
import CmdK from './components/CmdK';

function App() {
  return (
    <>
      <CmdK />
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
    </>
  );
}

export default App;
