import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const r = size * 0.25

  // Background
  ctx.fillStyle = '#1c1917'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // Pin body
  const cx = size * 0.5
  const cy = size * 0.42
  const pinR = size * 0.22

  ctx.fillStyle = '#f5f5f4'
  ctx.beginPath()
  ctx.arc(cx, cy, pinR, Math.PI, 0)
  ctx.quadraticCurveTo(cx + pinR, cy + pinR * 1.5, cx, cy + pinR * 2.8)
  ctx.quadraticCurveTo(cx - pinR, cy + pinR * 1.5, cx - pinR, cy)
  ctx.closePath()
  ctx.fill()

  // Inner dot
  ctx.fillStyle = '#1c1917'
  ctx.beginPath()
  ctx.arc(cx, cy, pinR * 0.38, 0, Math.PI * 2)
  ctx.fill()

  return canvas.toBuffer('image/png')
}

writeFileSync('public/icons/icon-192.png', drawIcon(192))
writeFileSync('public/icons/icon-512.png', drawIcon(512))
console.log('Icons generated.')