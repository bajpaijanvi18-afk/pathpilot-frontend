import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './contexts/StoreContext';
import { ThemedToaster } from './components/ThemedToaster';
import { AppShell } from './components/AppShell';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { ApplicationDetails } from './pages/ApplicationDetails';
import { ResumeVault } from './pages/ResumeVault';
import { InterviewPrep } from './pages/InterviewPrep';
import { CalendarPage } from './pages/CalendarPage';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ThemedToaster />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="resumes" element={<ResumeVault />} />
            <Route path="prep" element={<InterviewPrep />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>);

}