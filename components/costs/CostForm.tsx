'use client'

import { useState } from 'react'
import { Cost } from '@/types'
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
import { getCategoryIcon } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

export interface CostEntry {
  id: string
  amount: string
  currency: string
  category: Cost['category']
  note: string
}

interface Props {
  costs: CostEntry[]
  onChange: (costs: CostEntry[]) => void
}

const CATEGORIES: Cost['category'][] = [
  'food', 'transport', 'accommodation', 'activities', 'shopping', 'misc'
]

function newCost(): CostEntry {
  return {
    id: Math.random().toString(36).slice(2),
    amount: '',
    currency: 'INR',
    category: 'misc',
    note: '',
  }
}

export default function CostForm({ costs, onChange }: Props) {
  function addCost() {
    onChange([...costs, newCost()])
  }

  function updateCost(id: string, field: keyof CostEntry, value: string) {
    onChange(costs.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  function removeCost(id: string) {
    onChange(costs.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-3">
      {costs.map((cost) => (
        <div
          key={cost.id}
          className="grid grid-cols-[1fr_80px_1fr_auto] gap-2 items-end"
        >
          {/* Category */}
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select
              value={cost.category}
              onValueChange={(v) => updateCost(cost.id, 'category', v)}
            >
              <SelectTrigger className="bg-stone-50 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label className="text-xs">Amount</Label>
            <Input
              type="number"
              placeholder="0"
              value={cost.amount}
              onChange={(e) => updateCost(cost.id, 'amount', e.target.value)}
              className="bg-stone-50 h-9 text-sm"
              min="0"
            />
          </div>

          {/* Note */}
          <div className="space-y-1">
            <Label className="text-xs">Note</Label>
            <Input
              placeholder="e.g. Lunch at dhaba"
              value={cost.note}
              onChange={(e) => updateCost(cost.id, 'note', e.target.value)}
              className="bg-stone-50 h-9 text-sm"
            />
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeCost(cost.id)}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCost}
        className="gap-1.5 text-stone-600"
      >
        <Plus className="w-3.5 h-3.5" /> Add expense
      </Button>
    </div>
  )
}