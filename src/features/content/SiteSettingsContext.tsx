import { createContext, useContext, type ReactNode } from 'react'
import { defaultSiteSettings, type SiteSettings } from '../../types/content'
import { useAsync } from '../../hooks/useAsync'
import { fetchSiteSettings } from './api'

const Ctx = createContext<SiteSettings>(defaultSiteSettings)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useAsync(fetchSiteSettings, [])
  return <Ctx.Provider value={data ?? defaultSiteSettings}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteSettings = () => useContext(Ctx)
