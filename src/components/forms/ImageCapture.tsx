'use client'
import { useState, useRef } from 'react'
import { Camera, X, ImageIcon, Loader2 } from 'lucide-react'

interface Props {
  onCapture: (base64Url: string) => void
  label?: string
}

export default function ImageCapture({ onCapture, label = 'Product Photo (Optional)' }: Props) {
  const [image, setImage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessing(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Compress image to fit well within base64 string
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Compress as JPEG (0.6 quality is usually good for small sizes)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
        setImage(dataUrl)
        onCapture(dataUrl)
        setProcessing(false)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImage(null)
    onCapture('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      <label className="label">{label}</label>
      
      {image ? (
        <div className="relative w-full aspect-video bg-brand-deep rounded-2xl overflow-hidden border border-brand-border group">
          <img src={image} className="w-full h-full object-cover" alt="Captured" />
          <button 
            type="button" 
            onClick={clearImage}
            className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-brand-red transition-colors backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="w-full aspect-[21/9] bg-brand-deep/50 border border-brand-border border-dashed rounded-2xl
                     flex flex-col items-center justify-center gap-2 text-brand-muted hover:text-brand-text
                     hover:bg-brand-dark hover:border-brand-text-dim transition-all duration-300"
        >
          {processing ? (
            <>
              <Loader2 size={24} className="animate-spin text-brand-red" />
              <span className="text-sm font-display font-medium">Processing...</span>
            </>
          ) : (
            <>
              <div className="bg-brand-card p-3 rounded-full shadow-lg border border-brand-border">
                <Camera size={24} className="text-brand-text" />
              </div>
              <span className="text-sm font-display font-medium">Tap to Take Photo</span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input for camera access */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={inputRef}
        onChange={handleCapture}
        className="hidden"
      />
    </div>
  )
}
