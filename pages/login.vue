<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img
            src="img//card-primary.png"
            alt=""
          >
          <h1 class="card-title">
            IoT GL
          </h1>
        </template>

        <div>
          <base-input
            v-model="user.email"
            name="email"
            placeholder="Email"
            addon-left-icon="tim-icons icon-email-85"
          />

          <base-input
            v-model="user.password"
            name="contraseña"
            type="password"
            placeholder="Contraseña"
            addon-left-icon="tim-icons icon-lock-circle"
          />
        </div>

        <div slot="footer">
          <base-button
            native-type="submit"
            type="primary"
            class="mb-3"
            size="lg"
            block
            @click="login()"
          >
            Iniciar sesión
          </base-button>
          <div class="pull-left">
            <h6>
              <nuxt-link
                class="link footer-link"
                to="/register"
              >
                Crear cuenta
              </nuxt-link>
            </h6>
          </div>

          <div class="pull-right">
            <h6>
              <a
                href="#help!!!"
                class="link footer-link"
              >Necesita ayuda?
              </a>
            </h6>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>

<script>

export default {
  middleware: 'notAuthenticated',
  name: 'LoginPage',
  layout: 'auth',
  data() {
    return {
      user: {
        email: '',
        password: '',
      },
    };
  },
  mounted() {

  },
  methods: {
    login() {
      this.$axios
        .post('/login', this.user)
        .then((res) => {
          // Satisfactorio! - Usuario logueado.
          console.log(res.data);
          if (res.data.status === '200') {
            this.$notify({
              type: 'success',
              icon: 'tim-icons icon-check-2',
              message: `Bienvenide ${res.data.userData.name}`,
            });

            console.log(res.data);
            const auth = {
              token: res.data.token,
              userData: res.data.userData,
            };
            // Token a la tienda
            this.$store.commit('setAuth', auth);

            // Guardamos el token en localStorage
            localStorage.setItem('auth', JSON.stringify(auth));

            // eslint-disable-next-line no-undef
            $nuxt.$router.push('/dashboard');
          }
        });
    },
  },
};
</script>

<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
