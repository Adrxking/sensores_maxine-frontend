import EmqxAuthRule from '../models/emqx_auth';

const express = require('express');

const router = express.Router();
const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

const auth = {
  auth: {
    username: 'admin',
    password: 'public',
  },
};

global.saverResource = null;
global.alarmResource = null;

// ***************************************************
// ******** ADMINISTRADOR DE RECURSOS DE EMQX ********
// ***************************************************

// Crear recursos
async function createResources() {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/resources`;

    const data1 = {
      type: 'web_hook',
      config: {
        url: `http://${process.env.WEBHOOKS_HOST}:3001/api/saver-webhook`,
        headers: {
          token: process.env.EMQX_API_TOKEN,
        },
        method: 'POST',
      },
      description: 'saver-webhook',
    };

    const data2 = {
      type: 'web_hook',
      config: {
        url: `http://${process.env.WEBHOOKS_HOST}:3001/api/alarm-webhook`,
        headers: {
          token: process.env.EMQX_API_TOKEN,
        },
        method: 'POST',
      },
      description: 'alarm-webhook',
    };

    const res1 = await axios.post(url, data1, auth);

    if (res1.status === 200) {
      console.log('Recurso de guardado creado!'.green);
    }

    const res2 = await axios.post(url, data2, auth);

    if (res2.status === 200) {
      console.log('Recurso de alarma creado!'.green);
    }

    setTimeout(() => {
      console.log('***** Recursos emqx creados! :) *****'.green);
      // eslint-disable-next-line no-use-before-define
      listResources();
    }, process.env.EMQX_RESOURCES_DELAY);
  } catch (error) {
    console.log('Error creando recursos');
    console.log(error);
  }
}

// Listar recursos
async function listResources() {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/resources/`;

    const res = await axios.get(url, auth);

    const size = res.data.data.length;

    if (res.status === 200) {
      if (size === 0) {
        console.log('***** Creando webhook de recursos de emqx *****'.green);

        createResources();
      } else if (size === 2) {
        res.data.data.forEach((resource) => {
          if (resource.description === 'alarm-webhook') {
            global.alarmResource = resource;

            console.log('▼ ▼ ▼ RECURSO DE ALARMA ENCONTRADO ▼ ▼ ▼ '.bgMagenta);
            console.log(global.alarmResource);
            console.log('▲ ▲ ▲ RECURSO DE ALARMA ENCONTRADO ▲ ▲ ▲ '.bgMagenta);
            console.log('\n');
            console.log('\n');
          }

          if (resource.description === 'saver-webhook') {
            global.saverResource = resource;

            console.log('▼ ▼ ▼ RECURSO DE GUARDADO ENCONTRADO ▼ ▼ ▼ '.bgMagenta);
            console.log(global.saverResource);
            console.log('▲ ▲ ▲ RECURSO DE GUARDADO ENCONTRADO ▲ ▲ ▲ '.bgMagenta);
            console.log('\n');
            console.log('\n');
          }
        });
      } else {
        // eslint-disable-next-line no-inner-declarations
        function printWarning() {
          console.log(
            `ELIMINAR TODOS LOS WEBHOOKS DE RECURSOS DE EMQX Y REINICIAR NODE - ${process.env.EMQX_API_HOST}:8085/#/resources`
              .red,
          );
          setTimeout(() => {
            printWarning();
          }, process.env.EMQX_RESOURCES_DELAY);
        }

        printWarning();
      }
    } else {
      console.log('Error en api emqx');
    }
  } catch (error) {
    console.log('Error listando recursos emqx');
    console.log(error);
  }
}

// Comprobar si eiste un superuser, si no se crea
global.check_mqtt_superuser = async function checkMqttSuperUser() {
  try {
    const superusers = await EmqxAuthRule.find({ type: 'superuser' });

    if (superusers.length > 0) {
      return;
    }
    if (superusers.length === 0) {
      await EmqxAuthRule.create(
        {
          publish: ['#'],
          subscribe: ['#'],
          userId: 'emqxmqttsuperuser',
          username: process.env.EMQX_NODE_SUPERUSER_USER,
          password: process.env.EMQX_NODE_SUPERUSER_PASSWORD,
          type: 'superuser',
          time: Date.now(),
          updatedTime: Date.now(),
        },
      );

      console.log('MQTT Super usuario creado');
    }
  } catch (error) {
    console.log('Error creando superusuario');
    console.log(error);
  }
};

setTimeout(() => {
  console.log('Listando recursos!');
  listResources();
}, process.env.EMQX_RESOURCES_DELAY);

module.exports = router;
