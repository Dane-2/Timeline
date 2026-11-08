import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import { RequireAdmin, RequireMember } from './features/auth/RouteGuards'
import { AppShell } from './components/layout/AppShell'
import { WelcomePage } from './pages/WelcomePage'
import { DashboardPage } from './pages/DashboardPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SetupNeededPage } from './pages/SetupNeededPage'
import { PaperLoader } from './components/scrapbook/PaperLoader'

// Loaded only when someone opens the tab, so the rest of the site stays light.
const RavePage = lazy(() => import('./features/rave/RavePage'))
const BeachPage = lazy(() => import('./features/beach/BeachPage'))
const SealPage = lazy(() => import('./features/seal/SealPage'))
// Admin screens are their own chunks — she never downloads them.
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const ContentListPage = lazy(() => import('./admin/ContentListPage').then((m) => ({ default: m.ContentListPage })))
const ContentEditorPage = lazy(() => import('./admin/ContentEditorPage').then((m) => ({ default: m.ContentEditorPage })))
const MediaLibraryPage = lazy(() => import('./admin/MediaLibraryPage').then((m) => ({ default: m.MediaLibraryPage })))
const CollectionsPage = lazy(() => import('./admin/CollectionsPage').then((m) => ({ default: m.CollectionsPage })))
const SettingsPage = lazy(() => import('./admin/SettingsPage').then((m) => ({ default: m.SettingsPage })))

export default function App() {
  if (!isSupabaseConfigured) return <SetupNeededPage />

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route
        element={
          <RequireMember>
            <AppShell />
          </RequireMember>
        }
      >
        <Route path="/home" element={<DashboardPage />} />
        <Route path="/timeline" element={<ComingSoonPage title="Timeline" />} />
        <Route path="/letters" element={<ComingSoonPage title="Letters" />} />
        <Route path="/notes" element={<ComingSoonPage title="Sticky notes" />} />
        <Route path="/photos" element={<ComingSoonPage title="Photos" />} />
        <Route path="/favorites" element={<ComingSoonPage title="Your favorite things" />} />
        <Route
          path="/beach"
          element={
            <Suspense fallback={<PaperLoader label="heading to the coast…" />}>
              <BeachPage />
            </Suspense>
          }
        />
        <Route
          path="/seal"
          element={
            <Suspense fallback={<PaperLoader label="establishing uplink…" />}>
              <SealPage />
            </Suspense>
          }
        />
        <Route
          path="/rave"
          element={
            <Suspense fallback={<PaperLoader label="turning the lights down…" />}>
              <RavePage />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <Suspense fallback={<PaperLoader label="opening the workshop…" />}>
              <AdminLayout />
            </Suspense>
          </RequireAdmin>
        }
      >
        <Route index element={<ContentListPage />} />
        <Route path="content/:id" element={<ContentEditorPage />} />
        <Route path="media" element={<MediaLibraryPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
