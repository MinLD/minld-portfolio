<script setup>
const options = {
  fullScreen: {
    enable: false,
  },

  background: {
    color: {
      value: 'transparent',
    },
  },

  fpsLimit: 120,

  particles: {
    number: {
      value: 200,
      density: {
        enable: true,
      },
    },

    color: {
      value: '#71717a',
    },

    opacity: {
      value: {
        min: 0.15,
        max: 0.4,
      },
    },

    size: {
      value: {
        min: 1,
        max: 2,
      },
    },

    links: {
      enable: true,
      distance: 150,
      color: '#71717a',
      opacity: 0.2,
      width: 1,
    },

    move: {
      enable: true,
      speed: 0.4,

      direction: 'none',

      outModes: {
        default: 'bounce',
      },
    },
  },

  interactivity: {
    detectsOn: 'window',

    events: {
      onHover: {
        enable: true,
        mode: 'repulse',
      },

      onClick: {
        enable: false,
      },

      resize: {
        enable: true,
      },
    },

    modes: {
      repulse: {
        distance: 120,
        duration: 0.4,
        speed: 1,
      },
    },
  },

  detectRetina: true,
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
    <vue-particles id="hero-particles" class="h-full w-full" :options="options" />
  </div>
</template>
