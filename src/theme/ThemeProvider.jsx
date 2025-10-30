import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { THEMES } from './themes'

const ThemeContext = createContext({ themeKey: 'ocean', setThemeKey: () => {} })

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState('ocean')

  useEffect(() => {
    const theme = THEMES[themeKey] || THEMES.ocean
    const root = document.documentElement
    Object.entries(theme).forEach(([k, v]) => {
      if (k.startsWith('--')) root.style.setProperty(k, v)
    })
    // lock theme since switcher is removed
  }, [themeKey])

  const value = useMemo(() => ({ themeKey, setThemeKey }), [themeKey])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}


