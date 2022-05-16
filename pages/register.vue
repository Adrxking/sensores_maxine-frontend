<template>
  <div class="container login-page">
    <div class="col-lg-4 col-md-6 ml-auto mr-auto">
      <card class="card-login card-white">
        <template slot="header">
          <img src="img//card-primary.png" alt="" />
          <h1 class="card-title">IoT GL</h1>
        </template>

        <div>
          <base-input
            name="nombre"
            v-model="user.name"
            placeholder="Nombre"
            addon-left-icon="tim-icons icon-badge"
          >
          </base-input>

          <base-input
            name="email"
            v-model="user.email"
            placeholder="Email"
            addon-left-icon="tim-icons icon-email-85"
          >
          </base-input>

          <base-input
            name="contraseña"
            v-model="user.password"
            type="password"
            placeholder="Contraseña"
            addon-left-icon="tim-icons icon-lock-circle"
          >
          </base-input>
        </div>

        <div slot="footer">
          <base-button
            native-type="submit"
            type="primary"
            class="mb-3"
            size="lg"
            @click="register()"
            block
          >
            Registrar
          </base-button>

          <div class="pull-left">
            <h6>
              <nuxt-link class="link footer-link" to="/login">
                Iniciar sesión
              </nuxt-link>
            </h6>
          </div>

          <div class="pull-right">
            <h6><a href="#help!!!" class="link footer-link">Necesitas ayuda?</a></h6>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
export default {
  middleware: 'notAuthenticated',
  layout: "auth",
  data() {
    return {
      user: {
        name: "",
        email: "",
        password: ""
      }
    };
  },
  methods: {
    register() {

      this.$axios
        .post("/register", this.user)
        .then(res => {
          //success! - Usuario creado.
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Registro satisfactorio!"
            });

            this.user.name = "";
            this.user.password = "";
            this.user.email = "";

            $nuxt.$router.push('/login');

            return;
          }

        })
        .catch(e => {
          console.log(e.response.data);

          if (e.response.data.error.errors.email.kind == "unique") {
            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "El usuario ya existe :("
            });

            return;

          } else {

            this.$notify({
              type: "danger",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Error creando el usuario..."
            });

            return;
          }
        });
    }
  }
};
</script>
<style>
.navbar-nav .nav-item p {
  line-height: inherit;
  margin-left: 5px;
}
</style>
