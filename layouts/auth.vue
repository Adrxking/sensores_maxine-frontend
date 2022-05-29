<template>
  <div class="wrapper">
    <notifications />

    <router-view name="header" />

    <div
      :class="{ content: true }"
      style="margin-top: 100px;"
    >
      <zoom-center-transition
        :duration="200"
        mode="out-in"
      >
        <!-- Tu contenido aquí -->
        <nuxt />
      </zoom-center-transition>
    </div>
  </div>
</template>
<script>
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import { ZoomCenterTransition } from 'vue2-transitions';

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    PerfectScrollbar(`.${className}`);
  } else {
    // Intentar inicializarlo más tarde en caso de que este componente sea cargado asíncronamente
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

export default {
  name: 'Auth',
  components: {
    ZoomCenterTransition,
  },
  data() {
    return {
      sidebarBackground: 'primary', // vue|blue|orange|green|red|primary
    };
  },
  mounted() {
    this.initScrollbar();
  },

  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    initScrollbar() {
      const docClasses = document.body.classList;
      const isWindows = navigator.platform.startsWith('Win');
      if (isWindows) {
        // Si estamos en windows OS activamos la función perfectScrollbar
        initScrollbar('sidebar');
        initScrollbar('main-panel');
        initScrollbar('sidebar-wrapper');

        docClasses.add('perfect-scrollbar-on');
      } else {
        docClasses.add('perfect-scrollbar-off');
      }
    },
  },
};
</script>

<style lang="scss">
$scaleSize: 0.95;

@keyframes zoomIn95 {
  from {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }

  to {
    opacity: 1;
  }
}

.main-panel .zoomIn {
  animation-name: zoomIn95;
}

@keyframes zoomOut95 {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: scale3d($scaleSize, $scaleSize, $scaleSize);
  }
}

.main-panel .zoomOut {
  animation-name: zoomOut95;
}
</style>
