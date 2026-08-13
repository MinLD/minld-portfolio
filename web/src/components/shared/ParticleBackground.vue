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

  // 120 là dư với background kiểu này
  fpsLimit: 60,

  // giảm tải trên màn hình DPI cao
  detectRetina: false,

  particles: {
    number: {
      // 200 quá nhiều với network có links
      value: 85,

      density: {
        enable: true,
      },
    },

    color: {
      value: '#71717a',
    },

    opacity: {
      value: {
        min: 0.12,
        max: 0.35,
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

      // giảm số lượng đường cần tính/vẽ
      distance: 150,

      color: '#71717a',
      opacity: 0.18,
      width: 1,
    },

    // particle tự nó đứng yên
    move: {
      enable: false,
    },
  },

  interactivity: {
    // vẫn bắt chuột dù canvas pointer-events-none
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
        // vùng ảnh hưởng nhỏ hơn
        distance: 90,

        // quay về nhanh hơn
        duration: 0.2,

        // né nhẹ nhàng hơn
        speed: 0.55,
      },
    },
  },
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
    <vue-particles id="hero-particles" class="h-full w-full" :options="options" />
  </div>
</template>
