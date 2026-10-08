import React, { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'

export default function MultiSelectAutocomplete({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  label = "",
  maxDisplay = 5,
  searchable = true,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const optionName = typeof option === 'string' ? option : option.name || option
    return optionName.toLowerCase().includes(searchLower)
  })

  // Get selected items
  const selectedItems = selected || []

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true)
        return
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          toggleOption(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
      case 'Backspace':
        if (!searchTerm && selectedItems.length > 0) {
          removeOption(selectedItems[selectedItems.length - 1])
        }
        break
    }
  }

  const toggleOption = (option) => {
    const isSelected = selectedItems.includes(option)
    if (isSelected) {
      removeOption(option)
    } else {
      addOption(option)
    }
  }

  const addOption = (option) => {
    const newSelected = [...selectedItems, option]
    onChange(newSelected)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const removeOption = (option) => {
    const newSelected = selectedItems.filter(item => item !== option)
    onChange(newSelected)
  }

  const displaySelected = selectedItems.slice(0, maxDisplay)
  const remainingCount = selectedItems.length - maxDisplay

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      
      {/* Selected Tags Display */}
      <div
        className="min-h-[42px] border border-gray-300 rounded-md p-2 flex flex-wrap gap-2 bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Selected Tags */}
        {displaySelected.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-sm rounded-md"
          >
            {item}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeOption(item)
              }}
              className="hover:bg-gray-700 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* Remaining Count Badge */}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-md">
            +{remainingCount} more
          </span>
        )}
        
        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedItems.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          disabled={!searchable}
        />
        
        {/* Dropdown Arrow */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = selectedItems.includes(option)
              const isHighlighted = index === highlightedIndex
              
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between ${
                    isSelected ? 'bg-gray-100' : isHighlighted ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{option}</span>
                  {isSelected && <Check className="w-4 h-4 text-black" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
