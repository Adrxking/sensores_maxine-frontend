<template>
  <div
    class="wrapper"
    :class="{ 'nav-open': $sidebar.showSidebar }"
  >
    <notifications />

    <side-bar
      :background-color="sidebarBackground"
      short-title="GL"
      title="IoTicos GL"
    >
      <template slot-scope="props" slot="links">
        <sidebar-item
          :link="{
            name: 'Dashboard',
            icon: 'tim-icons icon-laptop',
            path: '/dashboard'
          }"
        />

        <sidebar-item
          :link="{
            name: 'Dispositivos',
            icon: 'tim-icons icon-light-3',
            path: '/devices'
          }"
        />

        <sidebar-item
          :link="{
            name: 'Alarmas',
            icon: 'tim-icons icon-bell-55',
            path: '/alarms'
          }"
        />

        <sidebar-item
          :link="{
            name: 'Plantillas',
            icon: 'tim-icons icon-atom',
            path: '/templates'
          }"
        />
      </template>
    </side-bar>

    <div
      class="main-panel"
      :data="sidebarBackground"
    >
      <dashboard-navbar />
      <router-view name="header" />

      <div
        :class="{ content: !isFullScreenRoute }"
        @click="toggleSidebar"
      >
        <zoom-center-transition
          :duration="1000"
          mode="out-in"
        >
          <!-- Tu contenido aquí -->
          <nuxt />
        </zoom-center-transition>
      </div>
      <content-footer v-if="!isFullScreenRoute" />
    </div>
  </div>
</template>

<script>
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import mqtt from 'mqtt';
import { ZoomCenterTransition } from 'vue2-transitions';
import DashboardNavbar from '../components/Layout/DashboardNavbar.vue';
import ContentFooter from '../components/Layout/ContentFooter.vue';

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    PerfectScrollbar(`.${className}`);
  } else {
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

export default {
  components: {
    DashboardNavbar,
    ContentFooter,
    ZoomCenterTransition,
  },
  data() {
    return {
      sidebarBackground: 'orange', // vue|blue|orange|green|red|primary
      client: null,
      options: {
        host: process.env.mqtt_host,
        port: process.env.mqtt_port,
        endpoint: '/mqtt',
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 5000,

        // Información de Certificado
        clientId:
          `web_${
            this.$store.state.auth.userData.name
          }_${
            Math.floor(Math.random() * 1000000 + 1)}`,
        username: '',
        password: '',
      },
    };
  },
  computed: {
    isFullScreenRoute() {
      return this.$route.path === '/maps/full-screen';
    },
  },
  mounted() {
    this.$store.dispatch('getNotifications');

    setTimeout(() => {
      this.startMqttClient();
    }, 2000);
  },
  beforeDestroy() {
    this.$nuxt.$off('mqtt-sender');
  },
  methods: {
    async getMqttCredentials() {
      try {
        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.token,
          },
        };
        const credentials = await this.$axios.post(
          '/getmqttcredentials',
          null,
          axiosHeaders,
        );
        console.log(credentials.data);

        if (credentials.data.status === 'success') {
          this.options.username = credentials.data.username;
          this.options.password = credentials.data.password;
        }
      } catch (error) {
        console.log(error);

        if (error.response.status === 401) {
          console.log('NO VALID TOKEN');
          localStorage.clear();

          const auth = {};
          this.$store.commit('setAuth', auth);

          window.location.href = '/login';
        }
      }
    },

    async getMqttCredentialsForReconnection() {
      try {
        const axiosHeaders = {
          headers: {
            token: this.$store.state.auth.token,
          },
        };

        const credentials = await this.$axios.post(
          '/getmqttcredentialsforreconnection',
          null,
          axiosHeaders,
        );
        console.log(credentials.data);

        if (credentials.data.status === 'success') {
          this.client.options.username = credentials.data.username;
          this.client.options.password = credentials.data.password;
        }
      } catch (error) {
        console.log(error);

        if (error.response.status === 401) {
          console.log('TOKEN NO VALIDO');
          localStorage.clear();

          const auth = {};
          this.$store.commit('setAuth', auth);

          window.location.href = '/login';
        }
      }
    },

    async startMqttClient() {
      await this.getMqttCredentials();
      // eslint-disable-next-line no-underscore-dangle
      const deviceSubscribeTopic = `${this.$store.state.auth.userData._id}/+/+/sdata`;
      // eslint-disable-next-line no-underscore-dangle
      const notifSubscribeTopic = `${this.$store.state.auth.userData._id}/+/+/notif`;

      const connectUrl = `${process.env.mqtt_prefix + this.options.host
      }:${
        this.options.port
      }${this.options.endpoint}`;

      try {
        this.client = mqtt.connect(connectUrl, this.options);
      } catch (error) {
        console.log(error, 'error connect mqtt');
      }

      // CONEXIÓN MQTT SATISFACTORIA
      this.client.on('connect', () => {
        console.log(this.client);

        console.log('Conexión satisfactoria!');

        // Suscripción SDATA
        this.client.subscribe(deviceSubscribeTopic, { qos: 0 }, (err) => {
          if (err) {
            console.log('Error en suscripción del dispositivo');
            return;
          }
          console.log('Suscripción del dispositivo satisfactoria');
          console.log(deviceSubscribeTopic);
        });

        // SUSCRIPCIÓN NOTIFICACIÓN
        this.client.subscribe(notifSubscribeTopic, { qos: 0 }, (err) => {
          if (err) {
            console.log('Error en suscripción de notificación');
            return;
          }
          console.log('Suscripción de notificación satisfactoria');
          console.log(notifSubscribeTopic);
        });
      });

      this.client.on('error', (error) => {
        console.log('Conexión fallida', error);
      });

      this.client.on('reconnect', (error) => {
        console.log('Reconectando:', error);
        this.getMqttCredentialsForReconnection();
      });

      this.client.on('disconnect', (error) => {
        console.log('Evento de desconeción MQTT lanzada:', error);
      });

      this.client.on('message', (topic, message) => {
        console.log(`Mensaje del tópico ${topic} -> `);
        console.log(message.toString());

        try {
          const splittedTopic = topic.split('/');
          const msgType = splittedTopic[3];

          if (msgType === 'notif') {
            this.$notify({
              type: 'danger',
              icon: 'tim-icons icon-alert-circle-exc',
              message: message.toString(),
            });
            this.$store.dispatch('getNotifications');
            return;
          }
          if (msgType === 'sdata') {
            // eslint-disable-next-line no-undef
            $nuxt.$emit(topic, JSON.parse(message.toString()));
            return;
          }
        } catch (error) {
          console.log(error);
        }
      });

      // eslint-disable-next-line no-undef
      this.$nuxt.$on('mqtt-sender', (toSend) => {
        console.log(toSend.topic, JSON.stringify(toSend.msg), 'hey!!');
        this.client.publish(toSend.topic, JSON.stringify(toSend.msg));
      });
    },

    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    initScrollbar() {
      const docClasses = document.body.classList;
      const isWindows = navigator.platform.startsWith('Win');
      if (isWindows) {
        // Si estamos en windows activamos la función perfectScrollbar
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
