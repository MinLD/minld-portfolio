<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  density: {
    type: Number,
    default: 1,
  },
})

const canvasRef = ref(null)

let canvas = null
let ctx = null
let animationFrameId = null
let resizeObserver = null
let mobileMediaQuery = null

let width = 0
let height = 0
let particles = []
let isMobile = false

const pointer = {
  x: 0,
  y: 0,
  active: false,
}

/**
 * Desktop config
 */
const desktopConfig = {
  minParticles: 150,
  maxParticles: 250,
  areaPerParticle: 16000,

  particleRadius: 1.4,

  linkDistance: 170,
  linkOpacity: 0.28,

  interactionRadius: 160,
  repulseStrength: 3.8,

  springStrength: 0.02,
  friction: 0.84,
}

/**
 * Mobile config
 *
 * Ít node hơn + link ngắn hơn
 * để tránh dồn thành 1 cục.
 */
const mobileConfig = {
  minParticles: 38,
  maxParticles: 70,
  areaPerParticle: 11000,

  particleRadius: 1.15,

  linkDistance: 105,
  linkOpacity: 0.18,

  interactionRadius: 110,
  repulseStrength: 2.7,

  springStrength: 0.016,
  friction: 0.88,
}

function getConfig() {
  return isMobile ? mobileConfig : desktopConfig
}

function random(min, max) {
  return Math.random() * (max - min) + min
}

function getParticleCount() {
  const config = getConfig()
  const area = width * height

  const count = Math.floor((area / config.areaPerParticle) * props.density)

  return Math.min(
    Math.round(config.maxParticles * props.density),
    Math.max(Math.round(config.minParticles * props.density), count),
  )
}

function createParticles() {
  const config = getConfig()
  const count = getParticleCount()

  particles = Array.from({ length: count }, () => {
    const x = random(0, width)
    const y = random(0, height)

    return {
      x,
      y,

      /**
       * Vị trí gốc tuyệt đối.
       */
      originX: x,
      originY: y,

      /**
       * Base position có thể chuyển động nhẹ trên mobile.
       */
      baseX: x,
      baseY: y,

      vx: 0,
      vy: 0,

      radius: random(0.7, config.particleRadius),

      /**
       * Dùng cho chuyển động tự động trên mobile.
       */
      phase: random(0, Math.PI * 2),

      orbitX: random(4, 14),
      orbitY: random(4, 12),

      orbitSpeed: random(0.00025, 0.0006),
    }
  })
}

function resizeCanvas() {
  if (!canvas || !ctx) return

  const rect = canvas.getBoundingClientRect()

  width = rect.width
  height = rect.height

  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  createParticles()
}

/**
 * Mouse + touch cùng sử dụng PointerEvent.
 */
function updatePointerPosition(event) {
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()

  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height

  if (!inside) {
    pointer.active = false
    return
  }

  pointer.x = x
  pointer.y = y
  pointer.active = true
}

function handlePointerMove(event) {
  /**
   * Desktop:
   * chỉ cần di chuột là active.
   *
   * Mobile:
   * khi user đang vuốt/chạm cũng active.
   */
  updatePointerPosition(event)
}

function handlePointerDown(event) {
  updatePointerPosition(event)
}

function handlePointerUp(event) {
  /**
   * Desktop không tắt vì chuột vẫn còn trong màn hình.
   *
   * Touch thì bỏ interaction sau khi nhấc tay.
   */
  if (event.pointerType !== 'mouse') {
    pointer.active = false
  }
}

function handleMouseLeave() {
  pointer.active = false
}

/**
 * Trên mobile không có mouse.
 *
 * Vì vậy tạo một "con trỏ ảo" tự chạy qua màn hình.
 *
 * Nó tạo hiệu ứng network tự động ngay cả khi
 * người dùng không chạm vào màn hình.
 */
function getAutoInteraction(time) {
  return {
    x: width * (0.5 + Math.sin(time * 0.00032) * 0.34),

    y: height * (0.5 + Math.cos(time * 0.00027) * 0.3),

    active: true,

    /**
     * Không đẩy mạnh như chuột thật.
     */
    strength: 0.55,
  }
}

function getInteraction(time) {
  /**
   * Nếu user đang touch / mouse
   * thì ưu tiên vị trí thật.
   */
  if (pointer.active) {
    return {
      x: pointer.x,
      y: pointer.y,
      active: true,
      strength: 1,
    }
  }

  /**
   * Mobile tự tạo interaction.
   */
  if (isMobile) {
    return getAutoInteraction(time)
  }

  return {
    active: false,
    x: 0,
    y: 0,
    strength: 0,
  }
}

function applyRepulse(particle, interaction, config) {
  if (!interaction.active) return

  const dx = particle.x - interaction.x
  const dy = particle.y - interaction.y

  const distanceSquared = dx * dx + dy * dy

  const radiusSquared = config.interactionRadius * config.interactionRadius

  if (distanceSquared <= 0 || distanceSquared >= radiusSquared) {
    return
  }

  const distance = Math.sqrt(distanceSquared)

  const force = (config.interactionRadius - distance) / config.interactionRadius

  const forceX = dx / distance
  const forceY = dy / distance

  const strength = config.repulseStrength * interaction.strength

  particle.vx += forceX * force * strength
  particle.vy += forceY * force * strength
}

function updateParticle(particle, time, interaction) {
  const config = getConfig()

  /**
   * MOBILE AUTO MOVEMENT
   *
   * Mỗi node có quỹ đạo nhỏ riêng.
   *
   * Vì vậy ngay cả khi không có touch,
   * mạng particle vẫn chuyển động.
   */
  if (isMobile) {
    particle.baseX =
      particle.originX + Math.sin(time * particle.orbitSpeed + particle.phase) * particle.orbitX

    particle.baseY =
      particle.originY +
      Math.cos(time * particle.orbitSpeed * 0.85 + particle.phase) * particle.orbitY
  } else {
    particle.baseX = particle.originX
    particle.baseY = particle.originY
  }

  /**
   * Repulse
   */
  applyRepulse(particle, interaction, config)

  /**
   * Spring về vị trí base
   */
  const springX = particle.baseX - particle.x

  const springY = particle.baseY - particle.y

  particle.vx += springX * config.springStrength

  particle.vy += springY * config.springStrength

  /**
   * Damping
   */
  particle.vx *= config.friction
  particle.vy *= config.friction

  /**
   * Update position
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
  const config = getConfig()

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

      const opacity = (1 - distance / config.linkDistance) * config.linkOpacity

      ctx.beginPath()

      ctx.moveTo(particleA.x, particleA.y)

      ctx.lineTo(particleB.x, particleB.y)

      ctx.strokeStyle = `rgba(113, 113, 122, ${opacity})`

      ctx.lineWidth = isMobile ? 0.55 : 0.7

      ctx.stroke()
    }
  }
}

function animate(time = 0) {
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  const interaction = getInteraction(time)

  for (const particle of particles) {
    updateParticle(particle, time, interaction)
  }

  drawLinks()

  for (const particle of particles) {
    drawParticle(particle)
  }

  animationFrameId = requestAnimationFrame(animate)
}

function updateDeviceMode() {
  const newValue = mobileMediaQuery.matches

  if (newValue === isMobile) {
    return
  }

  isMobile = newValue

  /**
   * Re-create particles vì mobile/desktop
   * có mật độ khác nhau.
   */
  resizeCanvas()
}

onMounted(() => {
  canvas = canvasRef.value

  if (!canvas) return

  ctx = canvas.getContext('2d')

  /**
   * Mobile nếu:
   *
   * - màn hình <= 768px
   * HOẶC
   * - thiết bị sử dụng pointer coarse (touch).
   */
  mobileMediaQuery = window.matchMedia('(max-width: 768px), (pointer: coarse)')

  isMobile = mobileMediaQuery.matches

  resizeCanvas()

  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })

  resizeObserver.observe(canvas)

  mobileMediaQuery.addEventListener('change', updateDeviceMode)

  window.addEventListener('pointermove', handlePointerMove, {
    passive: true,
  })

  window.addEventListener('pointerdown', handlePointerDown, {
    passive: true,
  })

  window.addEventListener('pointerup', handlePointerUp, {
    passive: true,
  })

  window.addEventListener('pointercancel', handlePointerUp, {
    passive: true,
  })

  document.addEventListener('mouseleave', handleMouseLeave)

  animate()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  resizeObserver?.disconnect()

  mobileMediaQuery?.removeEventListener('change', updateDeviceMode)

  window.removeEventListener('pointermove', handlePointerMove)

  window.removeEventListener('pointerdown', handlePointerDown)

  window.removeEventListener('pointerup', handlePointerUp)

  window.removeEventListener('pointercancel', handlePointerUp)

  document.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none absolute inset-0 z-0 h-full w-full"
    aria-hidden="true"
  />
</template>
