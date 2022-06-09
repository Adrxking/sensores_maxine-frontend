<template>
  <div>
    <!-- FORM AÑADIR DISPOSITIVO -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Añade un nuevo dispositivo</h4>
        </div>

        <div class="row">
          <div class="col-4">
            <base-input
              label="Nombre del dispositivo"
              type="text"
              placeholder="Ej: Casa, Oficina..."
              v-model="newDevice.name"
            >
            </base-input>
          </div>

          <div class="col-4">
            <base-input
              label="ID del dispositivo"
              type="text"
              placeholder="Ej: 7777-8888"
              v-model="newDevice.dId"
            >
            </base-input>
          </div>

          <div class="col-4">
            <slot name="label">
              <label> Plantilla </label>
            </slot>

            <el-select
              v-model="selectedIndexTemplate"
              placeholder="Seleccionar Plantilla"
              class="select-primary"
              style="width:100%"
            >
              <el-option
                v-for="(template, index) in templates"
                :key="template._id"
                class="text-dark"
                :value="index"
                :label="template.name"
              ></el-option>
            </el-select>
          </div>
        </div>

        <div class="row pull-right">
          <div class="col-12">
            <base-button
              @click="createNewDevice()"
              type="primary"
              class="mb-3"
              size="lg"
              >Añadir</base-button
            >
          </div>
        </div>
      </card>
    </div>

    <!-- TABLA DE DISPOSITIVOS -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Dispositivos</h4>
        </div>

        <el-table :data="$store.state.devices">
          <el-table-column label="#" min-width="50" align="center">
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>

          <el-table-column prop="name" label="Nombre"></el-table-column>

          <el-table-column prop="dId" label="Id Dispositivo"></el-table-column>

          <el-table-column prop="password" label="Contraseña"></el-table-column>

          <el-table-column
            prop="templateName"
            label="Plantilla"
          ></el-table-column>

          <!-- COLUMNA CON ACCIONES -->
          <el-table-column label="Actions">

            <div slot-scope="{ row, $index }">
              <!-- INDICADOR ESTADO DEL SERVIDOR -->
              <el-tooltip
                content="Indicador Estado del Servidor"
                style="margin-right:10px"
              >
                <i
                  class="fas fa-database "
                  :class="{
                    'text-success': row.saverRule.status,
                    'text-dark': !row.saverRule.status
                  }"
                ></i>
              </el-tooltip>

              <!-- BOTON REGLA GUARDAR EN LA BD -->
              <el-tooltip content="Guardar en la base de datos">
                <base-switch
                  @click="updateSaverRuleStatus(row.saverRule)"
                  :value="row.saverRule.status"
                  type="primary"
                  on-text="On"
                  off-text="Off"
                ></base-switch>
              </el-tooltip>

              <!-- BOTON ELIMINAR -->
              <el-tooltip
                content="Eliminar"
                effect="light"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  type="danger"
                  icon
                  size="sm"
                  class="btn-link"
                  @click="deleteDevice(row)"
                >
                  <i class="tim-icons icon-simple-remove "></i>
                </base-button>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </card>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";

export default {
  middleware: "authenticated",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select
  },
  data() {
    return {
      templates: [],
      selectedIndexTemplate: null,
      newDevice: {
        name: "",
        dId: "",
        templateId: "",
        templateName: ""
      }
    };
  },
  mounted() {

    this.getTemplates();
  },
  methods: {
    updateSaverRuleStatus(rule) {

      var ruleCopy = JSON.parse(JSON.stringify(rule));

      ruleCopy.status = !ruleCopy.status;

      const toSend = {
        rule: ruleCopy
      };

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      this.$axios
        .put("/saver-rule", toSend, axiosHeaders)
        .then(res => {


          if (res.data.status == "success") {

            this.$store.dispatch("getDevices");

            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: " Device Saver Status Updated"
            });

          }

          return;
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error updating saver rule status"
          });
          return;
        });
    },

    deleteDevice(device) {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.accessToken
        },
        params: {
          dId: device.dId
        }
      };

      this.$axios
        .delete("/device", axiosHeaders)
        .then(res => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " eliminado!"
            });
          }

          $nuxt.$emit("time-to-get-devices");

          return;
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error deleting " + device.name
          });
          return;
        });
    },
    //new device
    createNewDevice() {
      if (this.newDevice.name == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Device Name is Empty :("
        });
        return;
      }

      if (this.newDevice.dId == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Device ID is Empty :("
        });
        return;
      }

      if (this.selectedIndexTemplate == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: " Tempalte must be selected"
        });
        return;
      }

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      //ESCRIBIMOS EL NOMBRE Y EL ID DEL TEMPLATE SELECCIONADO EN EL OBJETO newDevice
      this.newDevice.templateId = this.templates[
        this.selectedIndexTemplate
      ]._id;
      this.newDevice.templateName = this.templates[
        this.selectedIndexTemplate
      ].name;
      this.newDevice.template = {}
      this.newDevice.template.widgets = this.templates[
        this.selectedIndexTemplate
      ].widgets;

      const toSend = {
        newDevice: this.newDevice
      };

      this.$axios
        .post("/device", toSend, axiosHeaders)
        .then(res => {
          if (res.data.status == "success") {
            this.$store.dispatch("getDevices");

            this.newDevice.name = "";
            this.newDevice.dId = "";
            this.selectedIndexTemplate = null;

            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "Success! Device was added"
            });

            return;
          }
        })
        .catch(e => {
          if (
            e.response.data.status == "error" &&
            e.response.data.error.errors.dId.kind == "unique"
          ) {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message:
                "The device is already registered in the system. Try another device"
            });
            return;
          } else {
            this.showNotify("danger", "Error");
            return;
          }
        });
    },

    //Get Templates
    async getTemplates() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token
        }
      };

      try {
        const res = await this.$axios.get("/template", axiosHeaders);
        console.log(res.data);

        if (res.data.status == "success") {
          this.templates = res.data.data;
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error getting templates..."
        });
        console.log(error);
        return;
      }
    },

    deleteDevice(device) {
      const axiosHeader = {
        headers: {
          token: this.$store.state.auth.token
        },
        params: {
          dId: device.dId
        }
      };

      this.$axios
        .delete("/device", axiosHeader)
        .then(res => {
          if (res.data.status == "success") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " deleted!"
            });
            this.$store.dispatch("getDevices");
          }
        })
        .catch(e => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: " Error deleting " + device.name
          });
        });
    },

  }
};
</script>
