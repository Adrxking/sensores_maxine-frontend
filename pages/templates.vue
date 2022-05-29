<template>
  <div>
    <!-- WIDGET CONFIGURADOR -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">
            Widgets {{ iotIndicatorConfig.column }}
          </h4>
        </div>

        <div class="row">
          <!-- WIDGET SELECTOR AND FORMS -->
          <div class="col-6">
            <!-- WIDGETS SELECTOR -->
            <el-select
              v-model="widgetType"
              class="select-success"
              placeholder="Select Widget"
              style="width: 100%;"
            >
              <el-option
                class="text-dark"
                value="numberchart"
                label="Number Chart INPUT <-"
              />
              <el-option
                class="text-dark"
                value="indicator"
                label="Boolean Indicator INPUT <-"
              />
              <el-option
                class="text-dark"
                value="map"
                label="Map INPUT <-"
              />
              <el-option
                class="text-dark"
                value="switch"
                label="Switch OUTPUT ->"
              />
              <el-option
                class="text-dark"
                value="button"
                label="Button OUTPUT ->"
              />
            </el-select>

            <br>
            <br>

            <!-- FORMS NUMBER CHART TYPE -->
            <div v-if="widgetType == 'numberchart'">
              <base-input
                v-model="ncConfig.variableFullName"
                label="Var Name"
                type="text"
              />

              <base-input
                v-model="ncConfig.unit"
                label="Unit"
                type="text"
              />

              <base-input
                v-model.number="ncConfig.decimalPlaces"
                label="Decimal Places"
                type="number"
              />

              <base-input
                v-model="ncConfig.icon"
                label="Icon"
                type="text"
              />

              <br>

              <base-input
                v-model.number="ncConfig.variableSendFreq"
                label="Send Freq"
                type="number"
              />

              <br>

              <base-input
                v-model.number="ncConfig.chartTimeAgo"
                label="Chart Back Time (mins)"
                type="number"
              />

              <br>

              <el-select
                v-model="ncConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >
                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                />
                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                />
                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                />
                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                />
              </el-select>

              <br><br><br>

              <el-select
                v-model="ncConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;"
              >
                <el-option
                  class="text-dark"
                  value="col-3"
                  label="col-3"
                />
                <el-option
                  class="text-dark"
                  value="col-4"
                  label="col-4"
                />
                <el-option
                  class="text-dark"
                  value="col-5"
                  label="col-5"
                />
                <el-option
                  class="text-dark"
                  value="col-6"
                  label="col-6"
                />
                <el-option
                  class="text-dark"
                  value="col-7"
                  label="col-7"
                />
                <el-option
                  class="text-dark"
                  value="col-8"
                  label="col-8"
                />
                <el-option
                  class="text-dark"
                  value="col-9"
                  label="col-9"
                />
                <el-option
                  class="text-dark"
                  value="col-10"
                  label="col-10"
                />
                <el-option
                  class="text-dark"
                  value="col-11"
                  label="col-11"
                />
                <el-option
                  class="text-dark"
                  value="col-12"
                  label="col-12"
                />
              </el-select>

              <br><br>
            </div>

            <!-- FORM SWITCH TYPE -->
            <div v-if="widgetType == 'switch'">
              <base-input
                v-model="iotSwitchConfig.variableFullName"
                label="Var Name"
                type="text"
              />

              <base-input
                v-model="iotSwitchConfig.icon"
                label="Icon"
                type="text"
              />

              <br>

              <el-select
                v-model="iotSwitchConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >
                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                />
                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                />
                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                />
                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                />
              </el-select>

              <br><br><br>

              <el-select
                v-model="iotSwitchConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;"
              >
                <el-option
                  class="text-dark"
                  value="col-3"
                  label="col-3"
                />
                <el-option
                  class="text-dark"
                  value="col-4"
                  label="col-4"
                />
                <el-option
                  class="text-dark"
                  value="col-5"
                  label="col-5"
                />
                <el-option
                  class="text-dark"
                  value="col-6"
                  label="col-6"
                />
                <el-option
                  class="text-dark"
                  value="col-7"
                  label="col-7"
                />
                <el-option
                  class="text-dark"
                  value="col-8"
                  label="col-8"
                />
                <el-option
                  class="text-dark"
                  value="col-9"
                  label="col-9"
                />
                <el-option
                  class="text-dark"
                  value="col-10"
                  label="col-10"
                />
                <el-option
                  class="text-dark"
                  value="col-11"
                  label="col-11"
                />
                <el-option
                  class="text-dark"
                  value="col-12"
                  label="col-12"
                />
              </el-select>

              <br><br>
            </div>

            <!-- FORM BUTTON TYPE -->
            <div v-if="widgetType == 'button'">
              <base-input
                v-model="configButton.variableFullName"
                label="Var Name"
                type="text"
              />

              <base-input
                v-model="configButton.message"
                label="Message to send"
                type="text"
              />

              <base-input
                v-model="configButton.text"
                label="Button Text"
                type="text"
              />

              <base-input
                v-model="configButton.icon"
                label="Icon"
                type="text"
              />

              <br>

              <el-select
                v-model="configButton.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >
                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                />
                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                />
                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                />
                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                />
              </el-select>

              <br><br><br>

              <el-select
                v-model="configButton.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;"
              >
                <el-option
                  class="text-dark"
                  value="col-3"
                  label="col-3"
                />
                <el-option
                  class="text-dark"
                  value="col-4"
                  label="col-4"
                />
                <el-option
                  class="text-dark"
                  value="col-5"
                  label="col-5"
                />
                <el-option
                  class="text-dark"
                  value="col-6"
                  label="col-6"
                />
                <el-option
                  class="text-dark"
                  value="col-7"
                  label="col-7"
                />
                <el-option
                  class="text-dark"
                  value="col-8"
                  label="col-8"
                />
                <el-option
                  class="text-dark"
                  value="col-9"
                  label="col-9"
                />
                <el-option
                  class="text-dark"
                  value="col-10"
                  label="col-10"
                />
                <el-option
                  class="text-dark"
                  value="col-11"
                  label="col-11"
                />
                <el-option
                  class="text-dark"
                  value="col-12"
                  label="col-12"
                />
              </el-select>

              <br><br>
            </div>

            <!-- FORM INDICATOR TYPE -->
            <div v-if="widgetType == 'indicator'">
              <base-input
                v-model="iotIndicatorConfig.variableFullName"
                label="Var Name"
                type="text"
              />

              <base-input
                v-model="iotIndicatorConfig.icon"
                label="Icon"
                type="text"
              />

              <br>

              <base-input
                v-model="iotIndicatorConfig.variableSendFreq"
                label="Send Freq"
                type="text"
              />

              <br>

              <el-select
                v-model="iotIndicatorConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%;"
              >
                <el-option
                  class="text-success"
                  value="success"
                  label="Success"
                />
                <el-option
                  class="text-primary"
                  value="primary"
                  label="Primary"
                />
                <el-option
                  class="text-warning"
                  value="warning"
                  label="Warning"
                />
                <el-option
                  class="text-danger"
                  value="danger"
                  label="Danger"
                />
              </el-select>

              <br><br><br>

              <el-select
                v-model="iotIndicatorConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%;"
              >
                <el-option
                  class="text-dark"
                  value="col-3"
                  label="col-3"
                />
                <el-option
                  class="text-dark"
                  value="col-4"
                  label="col-4"
                />
                <el-option
                  class="text-dark"
                  value="col-5"
                  label="col-5"
                />
                <el-option
                  class="text-dark"
                  value="col-6"
                  label="col-6"
                />
                <el-option
                  class="text-dark"
                  value="col-7"
                  label="col-7"
                />
                <el-option
                  class="text-dark"
                  value="col-8"
                  label="col-8"
                />
                <el-option
                  class="text-dark"
                  value="col-9"
                  label="col-9"
                />
                <el-option
                  class="text-dark"
                  value="col-10"
                  label="col-10"
                />
                <el-option
                  class="text-dark"
                  value="col-11"
                  label="col-11"
                />
                <el-option
                  class="text-dark"
                  value="col-12"
                  label="col-12"
                />
              </el-select>

              <br><br>
            </div>
          </div>

          <!-- WIDGET PREVIEW -->
          <div class="col-6">
            <Rtnumberchart
              v-if="widgetType == 'numberchart'"
              :config="ncConfig"
            />
            <Iotswitch
              v-if="widgetType == 'switch'"
              :config="iotSwitchConfig"
            />
            <Iotbutton
              v-if="widgetType == 'button'"
              :config="configButton"
            />
            <Iotindicator
              v-if="widgetType == 'indicator'"
              :config="iotIndicatorConfig"
            />
          </div>
        </div>

        <!-- ADD WIDGET BUTTON -->
        <div class="row pull-right">
          <div class="col-12">
            <base-button
              native-type="submit"
              type="primary"
              class="mb-3"
              size="lg"
              @click="addNewWidget()"
            >
              Add Widget
            </base-button>
          </div>
        </div>
      </card>
    </div>

    <!-- DASHBOARD PREVIEW -->
    <div class="row">
      <div
        v-for="(widget, index) in widgets"
        :key="index"
        :class="[widget.column]"
      >
        <i
          aria-hidden="true"
          class="fa fa-trash text-warning pull-right"
          style="margin-bottom: 10px;"
          @click="deleteWidget(index)"
        />

        <Rtnumberchart
          v-if="widget.widget == 'numberchart'"
          :config="widget"
        />

        <Iotswitch
          v-if="widget.widget == 'switch'"
          :config="widget"
        />

        <Iotbutton
          v-if="widget.widget == 'button'"
          :config="widget"
        />

        <Iotindicator
          v-if="widget.widget == 'indicator'"
          :config="widget"
        />
      </div>
    </div>

    <!-- SAVE TEMPLATE FORM-->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">
            Guardar plantilla
          </h4>
        </div>

        <div class="row">
          <base-input
            v-model="templateName"
            class="col-4"
            label="Template Name"
            type="text"
          />

          <base-input
            v-model="templateDescription"
            class="col-8"
            label="Template Description"
            type="text"
          />
        </div>

        <br><br>

        <div class="row">
          <div class="col-12">
            <base-button
              native-type="submit"
              type="primary"
              class="mb-3 pull-right"
              size="lg"
              :disabled="widgets.length == 0"
              @click="saveTemplate()"
            >
              Guardar plantilla
            </base-button>
          </div>
        </div>
      </card>
    </div>

    <!-- TEMPLATES TABLE -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">
            Plantillas
          </h4>
        </div>

        <div class="row">
          <el-table :data="templates">
            <el-table-column
              min-width="50"
              label="#"
              align="center"
            >
              <div
                slot-scope="{ row, $index }"
                class="photo"
              >
                {{ $index + 1 }}
              </div>
            </el-table-column>

            <el-table-column
              prop="name"
              label="Name"
            />

            <el-table-column
              prop="description"
              label="Descripción"
            />

            <el-table-column
              prop="widgets.length"
              label="Widgets"
            />

            <el-table-column
              header-align="right"
              align="right"
              label="Actions"
            >
              <div
                slot-scope="{ row, $index }"
                class="text-right table-actions"
              >
                <el-tooltip
                  content="Delete"
                  effect="light"
                  :open-delay="300"
                  placement="top"
                >
                  <base-button
                    type="danger"
                    icon
                    size="sm"
                    class="btn-link"
                    @click="deleteTemplate(row)"
                  >
                    <i class="tim-icons icon-simple-remove " />
                  </base-button>
                </el-tooltip>
              </div>
            </el-table-column>
          </el-table>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import {
  Table, TableColumn, Select, Option,
} from 'element-ui';

export default {
  middleware: 'authenticated',
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },
  data() {
    return {
      widgets: [],
      templates: [],
      widgetType: '',
      templateName: '',
      templateDescription: '',

      ncConfig: {
        userId: 'sampleuserid',
        selectedDevice: {
          name: 'Home',
          dId: '8888',
        },
        variableFullName: 'temperature',
        variable: 'varname',
        variableType: 'input',
        variableSendFreq: '30',
        unit: 'Watts',
        class: 'success',
        column: 'col-12',
        decimalPlaces: 2,
        widget: 'numberchart',
        icon: 'fa-sun',
        chartTimeAgo: 60,
        demo: true,
      },

      iotSwitchConfig: {
        userId: 'userid',
        selectedDevice: {
          name: 'Home',
          dId: '8888',
        },
        variableFullName: 'Luz',
        variable: 'varname',
        variableType: 'output',
        class: 'danger',
        widget: 'switch',
        icon: 'fa-bath',
        column: 'col-6',
      },

      iotIndicatorConfig: {
        userId: 'userid',
        selectedDevice: {
          name: 'Home',
          dId: '8888',
        },
        variableFullName: 'temperature',
        variable: 'varname',
        variableType: 'input',
        variableSendFreq: '30',
        class: 'success',
        widget: 'indicator',
        icon: 'fa-bath',
        column: 'col-6',
      },

      configButton: {
        userId: 'userid',
        selectedDevice: {
          name: 'Home',
          dId: '8888',
          templateName: 'Power Sensor',
          templateId: '984237562348756ldksjfh',
          saverRule: false,
        },
        variableFullName: 'Pump',
        variable: 'var1',
        variableType: 'output',
        icon: 'fa-sun',
        column: 'col-4',
        widget: 'button',
        class: 'danger',
        message: "{'fanstatus': 'stop'}",
      },

    };
  },

  mounted() {
    this.getTemplates();
  },

  methods: {
    // Obtener plantillas
    async getTemplates() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };

      try {
        const res = await this.$axios.get('/template', axiosHeaders);
        console.log(res.data);

        if (res.data.status === 'success') {
          this.templates = res.data.data;
        }
      } catch (error) {
        this.$notify({
          type: 'danger',
          icon: 'tim-icons icon-alert-circle-exc',
          message: 'Error getting templates...',
        });
        console.log(error);
      }
    },

    // Guardar plantilla
    async saveTemplate() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };

      console.log(axiosHeaders);

      const toSend = {
        template: {
          name: this.templateName,
          description: this.templateDescription,
          widgets: this.widgets,
        },
      };

      try {
        const res = await this.$axios.post('/template', toSend, axiosHeaders);

        if (res.data.status === 'success') {
          this.$notify({
            type: 'success',
            icon: 'tim-icons icon-alert-circle-exc',
            message: 'Template created!',
          });
          this.getTemplates();

          this.widgets = [];
        }
      } catch (error) {
        this.$notify({
          type: 'danger',
          icon: 'tim-icons icon-alert-circle-exc',
          message: 'Error creating template...',
        });
        console.log(error);
      }
    },

    // Delete Template
    async deleteTemplate(template) {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          // eslint-disable-next-line no-underscore-dangle
          templateId: template._id,
        },
      };

      console.log(axiosHeaders);

      try {
        const res = await this.$axios.delete('/template', axiosHeaders);

        console.log(res.data);

        if (res.data.status === 'fail' && res.data.error === 'template in use') {
          this.$notify({
            type: 'danger',
            icon: 'tim-icons icon-alert-circle-exc',
            message:
              `${template.name} está en uso.
              Primero elimina los dispositivos linkeados a la plantilla`,
          });

          return;
        }

        if (res.data.status === 'success') {
          this.$notify({
            type: 'success',
            icon: 'tim-icons icon-check-2',
            message: `${template.name} was deleted!`,
          });

          this.getTemplates();
        }
      } catch (error) {
        this.$notify({
          type: 'danger',
          icon: 'tim-icons icon-alert-circle-exc',
          message: 'Error getting templates...',
        });
        console.log(error);
      }
    },

    // Añadir widget
    addNewWidget() {
      if (this.widgetType === 'numberchart') {
        this.ncConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.ncConfig)));
      }

      if (this.widgetType === 'switch') {
        this.iotSwitchConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.iotSwitchConfig)));
      }

      if (this.widgetType === 'button') {
        this.configButton.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.configButton)));
      }

      if (this.widgetType === 'indicator') {
        this.iotIndicatorConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.iotIndicatorConfig)));
      }
    },

    // Eliminar Widget
    deleteWidget(index) {
      this.widgets.splice(index, 1);
    },

    makeid(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i += 1) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength),
        );
      }
      return result;
    },
  },
};
</script>
