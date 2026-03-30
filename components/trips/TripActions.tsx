'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trip } from '@/types'
import { useTrips } from '@/hooks/useTrips'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreVertical, Pencil, Trash2, Globe, Lock, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export default function TripActions({ trip }: { trip: Trip }) {
  const router = useRouter()
  const { updateTrip, deleteTrip } = useTrips()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: trip.title,
    destination: trip.destination,
    status: trip.status,
    end_date: trip.end_date ?? '',
  })

  async function handleUpdate() {
    setLoading(true)
    await updateTrip(trip.id, {
      title: form.title,
      destination: form.destination,
      status: form.status,
      end_date: form.end_date || undefined,
    })
    setLoading(false)
    setEditOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    setLoading(true)
    await deleteTrip(trip.id)
    setLoading(false)
    router.push('/trips')
  }

  async function togglePublic() {
    await updateTrip(trip.id, { is_public: !trip.is_public })
    if (!trip.is_public && trip.public_slug) {
      const url = `${window.location.origin}/share/${trip.public_slug}`
      await navigator.clipboard.writeText(url)
      toast.success('Trip made public — share link copied!')
    } else {
      toast.success('Trip is now private')
    }
    router.refresh()
  }

  async function copyShareLink() {
    if (!trip.public_slug) return
    const url = `${window.location.origin}/share/${trip.public_slug}`
    await navigator.clipboard.writeText(url)
    toast.success('Share link copied!')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit trip
          </DropdownMenuItem>
          <DropdownMenuItem onClick={togglePublic}>
            {trip.is_public ? (
              <><Lock className="w-4 h-4 mr-2" /> Make private</>
            ) : (
              <><Globe className="w-4 h-4 mr-2" /> Make public</>
            )}
          </DropdownMenuItem>
          {trip.is_public && (
            <DropdownMenuItem onClick={copyShareLink}>
              <Share2 className="w-4 h-4 mr-2" /> Copy share link
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Trip name</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="bg-stone-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Input
                value={form.destination}
                onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
                className="bg-stone-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>End date</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                className="bg-stone-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as any }))}
              >
                <SelectTrigger className="bg-stone-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800"
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this trip?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-500">
            This will permanently delete <strong>{trip.title}</strong> and all its
            days, images, and costs. This cannot be undone.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}