import Device from '../models/device';
import SaverRule from '../models/emqx_saver_rule';
import Template from '../models/template';
import AlarmRule from '../models/emqx_alarm_rule';
import EmqxAuthRule from '../models/emqx_auth';

const express = require('express');

const router = express.Router();
const axios = require('axios');

const { checkAuth } = require('../middlewares/authentication');

// **********************
// **** FUNCIONES *******
// **********************

async function getAlarmRules(userId) {
  try {
    const rules = await AlarmRule.find({ userId });
    return rules;
  } catch (error) {
    return 'error';
  }
}

async function selectDevice(userId, dId) {
  try {
    await Device.updateMany(
      { userId },
      { selected: false },
    );

    await Device.updateOne(
      { dId, userId },
      { selected: true },
    );

    return true;
  } catch (error) {
    console.log("ERROR EN LA FUNCIÓN 'selectDevice' ");
    console.log(error);
    return false;
  }
}

// FUNCIÓN FOR EACH ASYNC
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

/*
 FUNCIONES DE GUARDADO DE REGLAS
*/

// Obtener plantillas
async function getTemplates(userId) {
  try {
    const templates = await Template.find({ userId });
    return templates;
  } catch (error) {
    return false;
  }
}

// Obtener reglas de guardado
async function getSaverRules(userId) {
  try {
    const rules = await SaverRule.find({ userId });
    return rules;
  } catch (error) {
    return false;
  }
}

// Crear regla de guardado
async function createSaverRule(userId, dId, status) {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules`;

    const topic = `${userId}/${dId}/+/sdata`;

    const rawsql = `SELECT topic, payload FROM "${topic}" WHERE payload.save = 1`;

    const newRule = {
      rawsql,
      actions: [
        {
          name: 'data_to_webserver',
          params: {
            $resource: global.saverResource.id,
            payload_tmpl:
              `{"userId":"${
                userId
              }","payload":\${payload},"topic":"\${topic}"}`,
          },
        },
      ],
      description: 'SAVER-RULE',
      enabled: status,
    };

    // Guardar la regla en EMQX
    // eslint-disable-next-line no-use-before-define
    const res = await axios.post(url, newRule, auth);

    if (res.status === 200 && res.data.data) {
      await SaverRule.create({
        userId,
        dId,
        emqxRuleId: res.data.data.id,
        status,
      });

      return true;
    }
    return false;
  } catch (error) {
    console.log('ERROR CREANDO REGLA DE GUARDADO');
    console.log(error);
    return false;
  }
}

// Actualizar regla de guardado
async function updateSaverRuleStatus(emqxRuleId, status) {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules/${emqxRuleId}`;

    const newRule = {
      enabled: status,
    };

    // eslint-disable-next-line no-use-before-define
    const res = await axios.put(url, newRule, auth);

    if (res.status === 200 && res.data.data) {
      await SaverRule.updateOne({ emqxRuleId }, { status });
      console.log('ESTADO DE LA REGLA DE GUARDADO ACTUALIZADA...'.green);
      return true;
    }
    return false;
  } catch (error) {
    console.log(error, 'error Actualizar regla de guardado')
    return false;
  }
}

// Eliminar regla de guardado
async function deleteSaverRule(dId) {
  try {
    const mongoRule = await SaverRule.findOne({ dId });

    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules/${mongoRule.emqxRuleId}`;

    // eslint-disable-next-line no-use-before-define
    await axios.delete(url, auth);

    await SaverRule.deleteOne({ dId });

    return true;
  } catch (error) {
    console.log('ERROR ELIMINANDO REGLA DE GUARDADO');
    console.log(error);
    return false;
  }
}

// Eliminar todas las reglas de alarmas
async function deleteAllAlarmRules(userId, dId) {
  try {
    const rules = await AlarmRule.find({ userId, dId });

    if (rules.length > 0) {
      asyncForEach(rules, async (rule) => {
        const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules/${rule.emqxRuleId}`;
        // eslint-disable-next-line no-use-before-define
        await axios.delete(url, auth);
      });

      await AlarmRule.deleteMany({ userId, dId });
    }

    return true;
  } catch (error) {
    console.log(error);
    return 'error';
  }
}

// Eliminar todas las reglas de auth de los dispositivos EMQX
async function deleteMqttDeviceCredentials(dId) {
  try {
    await EmqxAuthRule.deleteMany({ dId, type: 'device' });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function makeid(length) {
  try {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// ******************
// **** A P I *******
// ******************

const auth = {
  auth: {
    username: 'admin',
    password: 'public',
  },
};

// OBTENER DISPOSITIVOS
router.get('/device', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    // Obtener dispositivos
    let devices = await Device.find({ userId });

    // Mongoose array a JS array
    devices = JSON.parse(JSON.stringify(devices));

    // Obtener reglas de guardado
    const saverRules = await getSaverRules(userId);

    // Obtener plantillas
    const templates = await getTemplates(userId);

    // Obtener reglas de alarmas
    const alarmRules = await getAlarmRules(userId);

    // Reglas de guardado a -> Dispositivos
    devices.forEach((device, index) => {
      // eslint-disable-next-line prefer-destructuring
      devices[index].saverRule = saverRules.filter(
        (saverRule) => saverRule.dId === device.dId,
      )[0];
      // eslint-disable-next-line prefer-destructuring
      devices[index].template = templates.filter(
        // eslint-disable-next-line no-underscore-dangle
        (template) => template._id === device.templateId,
      )[0];
      devices[index].alarmRules = alarmRules.filter(
        (alarmRule) => alarmRule.dId === device.dId,
      );
    });

    const response = {
      status: 'success',
      data: devices,
    };

    res.json(response);
  } catch (error) {
    console.log('ERROR OBTENIENDO DISPOSITIVOS');
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
  return false;
});

// Crear Dispositivo
router.post('/device', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    const { newDevice } = req.body;

    newDevice.userId = userId;

    newDevice.createdTime = Date.now();

    newDevice.password = makeid(10);

    await createSaverRule(userId, newDevice.dId, true);

    await Device.create(newDevice);

    await selectDevice(userId, newDevice.dId);

    const response = {
      status: 'success',
    };

    return res.json(response);
  } catch (error) {
    console.log('ERROR CREANDO NUEVO DISPOSITIVO');
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
});

// Eliminar Dispositivo
router.delete('/device', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;
    const { dId } = req.query;

    // ELIMINAR REGLA DE GUARDADO
    await deleteSaverRule(dId);

    // ELIMINAR TODAS LAS POSIBLES REGLAS DE ALARMAS
    await deleteAllAlarmRules(userId, dId);

    // ELIMINAR TODOS LAS POSIBLES CREDENCIALES DE DISPOSITIVOS MQTT
    await deleteMqttDeviceCredentials(dId);

    // ELIMINAR EL DISPOSITIVO
    const result = await Device.deleteOne({ userId, dId });

    // DISPOSITIVOS DESPUES DEL ELIMINADO
    const devices = await Device.find({ userId });

    if (devices.length >= 1) {
      let found = false;
      devices.forEach((device) => {
        if (device.selected === true) {
          found = true;
        }
      });

      if (!found) {
        await Device.updateMany({ userId }, { selected: false });
        await Device.updateOne(
          { userId, dId: devices[0].dId },
          { selected: true },
        );
      }
    }

    const response = {
      status: 'success',
      data: result,
    };

    return res.json(response);
  } catch (error) {
    console.log('ERROR ELIMINANDO DISPOSITIVO');
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
});

// Actualizar Dispositivo
router.put('/device', checkAuth, async (req, res) => {
  try {
    const { dId } = req.body;
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    if (await selectDevice(userId, dId)) {
      const response = {
        status: 'success',
      };

      return res.json(response);
    }
    const response = {
      status: 'error',
    };

    return res.json(response);
  } catch (error) {
    console.log(error);
  }
  return false;
});

// Actualizar estado de la regla de guardado
router.put('/saver-rule', checkAuth, async (req, res) => {
  try {
    const { rule } = req.body;

    console.log(rule);

    await updateSaverRuleStatus(rule.emqxRuleId, rule.status);

    const response = {
      status: 'success',
    };

    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
