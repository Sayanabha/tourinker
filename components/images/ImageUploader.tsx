'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, X, Loader2, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface UploadedImage {
  url: string
  storage_path: string
  caption: string
  tags: string[]
}

interface Props {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  userId: string
}

export default function ImageUploader({ images, onChange, userId }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    const uploaded: UploadedImage[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('trip-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(path)

      uploaded.push({ url: publicUrl, storage_path: path, caption: '', tags: [] })
    }

    onChange([...images, ...uploaded])
    setUploading(false)
    if (uploaded.length > 0) toast.success(`${uploaded.length} photo(s) uploaded`)
  }

  function updateImage(index: number, field: 'caption' | 'tags', value: string | string[]) {
    const updated = images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    )
    onChange(updated)
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function handleTagInput(index: number, raw: string) {
    const tags = raw.split(',').map((t) => t.trim()).filter(Boolean)
    updateImage(index, 'tags', tags)
  }

  return (
    <div className="space-y-3">
      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-stone-300 hover:bg-stone-50 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <Upload className="w-6 h-6" />
            <p className="text-sm">
              Drop photos here or <span className="text-stone-600 font-medium">browse</span>
            </p>
            <p className="text-xs">Max 5MB per image</p>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="flex gap-3 bg-stone-50 rounded-xl p-3 border border-stone-200">
              <img
                src={img.url}
                alt=""
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <Input
                  placeholder="Caption (optional)"
                  value={img.caption}
                  onChange={(e) => updateImage(i, 'caption', e.target.value)}
                  className="h-8 text-sm bg-white"
                />
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <Input
                    placeholder="Tags: beach, sunset, food"
                    value={img.tags.join(', ')}
                    onChange={(e) => handleTagInput(i, e.target.value)}
                    className="h-8 text-sm bg-white"
                  />
                </div>
                {img.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {img.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="text-stone-400 hover:text-red-500 transition-colors self-start"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}