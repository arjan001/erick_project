import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { X, Pen, RotateCcw, Check } from 'lucide-react'

export default function ESignatureModal({ isOpen, onClose, onSign, title = 'Sign Document' }) {
  const signatureRef = useRef()
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    if (signatureRef.current) {
      signatureRef.current.onBegin = () => setIsEmpty(false)
    }
  }, [])

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setIsEmpty(true)
    }
  }

  const handleSave = () => {
    if (signatureRef.current && !isEmpty) {
      const signatureData = signatureRef.current.toDataURL()
      onSign(signatureData)
      handleClear()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Please sign below using your mouse or touch screen. By signing, you agree to the terms and conditions of this agreement.
            </p>
          </div>
          
          <div className="border-2 border-gray-300 rounded-lg bg-white mb-4">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-64',
                style: { touchAction: 'none' }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Pen className="w-4 h-4" />
              <span>Draw your signature above</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isEmpty}
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  )
}
