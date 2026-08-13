<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)

let canvas
let ctx
let animationFrameId
let resizeObserver

let width = 0
let height = 0
let particles = []

const mouse = {
  x: 0,
  y: 0,
  active: false,
}

/**
 * Tinh chỉnh effect tại đây
 */
const config = {
  minParticles: 150,
  maxParticles: 250,

  particleRadius: 1.4,

  linkDistance: 170,

  mouseRadius: 160,

  // lực né chuột
  repulseStrength: 3.8,

  // lực kéo node về vị trí ban đầu
  springStrength: 0.02,

  // càng nhỏ càng ít rung
  friction: 0.84,
}

function random(min, max) {
  return Math.random() * (max - min) + min
}

function getParticleCount() {
  const area = width * height

  const count = Math.floor(area / 16000)

  return Math.min(config.maxParticles, Math.max(config.minParticles, count))
}

function createParticles() {
  const count = getParticleCount()

  particles = Array.from({ length: count }, () => {
    const x = random(0, width)
    const y = random(0, height)

    return {
      // vị trí hiện tại
      x,
      y,

      // vị trí gốc
      baseX: x,
      baseY: y,

      // vận tốc
      vx: 0,
      vy: 0,

      radius: random(0.8, config.particleRadius),
    }
  })
}

function resizeCanvas() {
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()

  width = rect.width
  height = rect.height

  // Cap DPR để màn hình 2K/4K không quá nặng
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  createParticles()
}

function handleMouseMove(event) {
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()

  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const insideCanvas = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height

  if (!insideCanvas) {
    mouse.active = false
    return
  }

  mouse.x = x
  mouse.y = y
  mouse.active = true
}

function handleMouseLeave() {
  mouse.active = false
}

function updateParticle(particle) {
  /**
   * 1. Nếu chuột ở gần → đẩy particle ra
   */
  if (mouse.active) {
    const dx = particle.x - mouse.x
    const dy = particle.y - mouse.y

    const distanceSquared = dx * dx + dy * dy
    const mouseRadiusSquared = config.mouseRadius * config.mouseRadius

    if (distanceSquared > 0 && distanceSquared < mouseRadiusSquared) {
      const distance = Math.sqrt(distanceSquared)

      const force = (config.mouseRadius - distance) / config.mouseRadius

      const forceX = dx / distance
      const forceY = dy / distance

      particle.vx += forceX * force * config.repulseStrength

      particle.vy += forceY * force * config.repulseStrength
    }
  }

  /**
   * 2. Spring
   *
   * Luôn kéo particle về baseX/baseY
   */
  const springX = particle.baseX - particle.x
  const springY = particle.baseY - particle.y

  particle.vx += springX * config.springStrength
  particle.vy += springY * config.springStrength

  /**
   * 3. Friction / damping
   *
   * Làm chuyển động mượt và không rung mãi
   */
  particle.vx *= config.friction
  particle.vy *= config.friction

  /**
   * 4. Cập nhật vị trí
   */
  particle.x += particle.vx
  particle.y += particle.vy
}

function drawParticle(particle) {
  ctx.beginPath()

  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)

  ctx.fillStyle = 'rgba(161, 161, 170, 0.5)'
  ctx.fill()
}

function drawLinks() {
  const maxDistanceSquared = config.linkDistance * config.linkDistance

  for (let i = 0; i < particles.length; i++) {
    const particleA = particles[i]

    for (let j = i + 1; j < particles.length; j++) {
      const particleB = particles[j]

      const dx = particleA.x - particleB.x
      const dy = particleA.y - particleB.y

      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared > maxDistanceSquared) {
        continue
      }

      const distance = Math.sqrt(distanceSquared)

      const opacity = (1 - distance / config.linkDistance) * 0.28

      ctx.beginPath()
      ctx.moveTo(particleA.x, particleA.y)
      ctx.lineTo(particleB.x, particleB.y)

      ctx.strokeStyle = `rgba(113, 113, 122, ${opacity})`
      ctx.lineWidth = 0.7

      ctx.stroke()
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height)

  for (const particle of particles) {
    updateParticle(particle)
  }

  drawLinks()

  for (const particle of particles) {
    drawParticle(particle)
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  canvas = canvasRef.value
  ctx = canvas.getContext('2d')

  resizeCanvas()

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })

  resizeObserver.observe(canvas)

  window.addEventListener('mousemove', handleMouseMove, {
    passive: true,
  })

  window.addEventListener('mouseout', handleMouseLeave)

  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)

  resizeObserver?.disconnect()

  window.removeEventListener('mousemove', handleMouseMove)

  window.removeEventListener('mouseout', handleMouseLeave)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none absolute inset-0 z-0 h-full w-full"
    aria-hidden="true"
  />
</template>
