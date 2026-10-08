import React, { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
]

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('ericrabar_language')
    if (savedLang) {
      setCurrentLang(savedLang)
    } else {
      // First visit - could add modal for selection
      localStorage.setItem('ericrabar_language', 'en')
    }
  }, [])

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode)
    localStorage.setItem('ericrabar_language', langCode)
    window.location.reload(); // Refresh to apply translations
  }

  const currentLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-gray-400 hover:text-white">
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${
              currentLang === lang.code ? 'bg-zinc-800' : ''
            } text-gray-300 hover:text-white hover:bg-zinc-800`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}