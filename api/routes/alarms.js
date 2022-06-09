import AlarmRule from '../models/emqx_alarm_rule';

const express = require('express');

const router = express.Router();
const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const { checkAuth } = require('../middlewares/authentication');

const auth = {
  auth: {
    username: 'admin',
    password: 'public',
  },
};

// **********************
// ****** FUNCIONES *****
// **********************

// Crear alarma
async function createAlarmRule(newAlarm) {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules`;

    const topic = `${newAlarm.userId}/${newAlarm.dId}/${newAlarm.variable}/sdata`;

    const rawsql = `SELECT username, topic, payload FROM "${
      topic
    }" WHERE payload.value ${
      newAlarm.condition
    } ${
      newAlarm.value
    } AND is_not_null(payload.value)`;

    const newRule = {
      rawsql,
      actions: [
        {
          name: 'data_to_webserver',
          params: {
            $resource: global.alarmResource.id,
            payload_tmpl:
              `{"userId":"${
                newAlarm.userId
              }","payload":\${payload},"topic":"\${topic}"}`,
          },
        },
      ],
      description: 'ALARM-RULE',
      enabled: newAlarm.status,
    };

    // save rule in emqx - grabamos la regla en emqx
    const res = await axios.post(url, newRule, auth);
    const emqxRuleId = res.data.data.id;

    if (res.data.data && res.status === 200) {
      // save rule in mongo -- grabamos regla en mongo
      const mongoRule = await AlarmRule.create({
        userId: newAlarm.userId,
        dId: newAlarm.dId,
        emqxRuleId,
        status: newAlarm.status,
        variable: newAlarm.variable,
        variableFullName: newAlarm.variableFullName,
        value: newAlarm.value,
        condition: newAlarm.condition,
        triggerTime: newAlarm.triggerTime,
        createTime: Date.now(),
      });

      // eslint-disable-next-line no-shadow
      const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules/${mongoRule.emqxRuleId}`;

      // eslint-disable-next-line camelcase
      const payload_templ = `{"userId":"${
        newAlarm.userId
      }","dId":"${
        newAlarm.dId
      }","deviceName":"${
        newAlarm.deviceName
      }","payload":\${payload},"topic":"\${topic}","emqxRuleId":"${
        mongoRule.emqxRuleId
      }","value":${
        newAlarm.value
      },"condition":"${
        newAlarm.condition
      }","variable":"${
        newAlarm.variable
      }","variableFullName":"${
        newAlarm.variableFullName
      }","triggerTime":${
        newAlarm.triggerTime
      }}`;

      // eslint-disable-next-line camelcase
      newRule.actions[0].params.payload_tmpl = payload_templ;

      await axios.put(url, newRule, auth);

      console.log('Nueva regla de alarma creada...'.green);

      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
}

// Actualizar estado de alarma
async function updateAlarmRuleStatus(emqxRuleId, status) {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules/${emqxRuleId}`;

    const newRule = {
      enabled: status,
    };

    const res = await axios.put(url, newRule, auth);

    if (res.data.data && res.status === 200) {
      await AlarmRule.updateOne({ emqxRuleId }, { status });

      console.log('Estado de la regla de guardado actualizada...'.green);

      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
}

// Eliminar una regla
async function deleteAlarmRule(emqxRuleId) {
  try {
    const url = `http://${process.env.EMQX_API_HOST}:8085/api/v4/rules/${emqxRuleId}`;

    await axios.delete(url, auth);

    await AlarmRule.deleteOne({ emqxRuleId });

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

//* *****************
//* *** A P I *******
//* *****************

// Crear regla de alarma
router.post('/alarm-rule', checkAuth, async (req, res) => {
  try {
    const { newRule } = req.body;
    // eslint-disable-next-line no-underscore-dangle
    newRule.userId = req.userData._id;

    const r = await createAlarmRule(newRule);

    if (r) {
      const response = {
        status: 'success',
      };

      return res.json(response);
    }
    const response = {
      status: 'error',
    };

    return res.status(500).json(response);
  } catch (error) {
    console.log(error);
  }
  return false;
});

// Actualizar estado de la regla de alarma
router.put('/alarm-rule', checkAuth, async (req, res) => {
  try {
    const { rule } = req.body;

    const r = await updateAlarmRuleStatus(rule.emqxRuleId, rule.status);

    if (r === true) {
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

// Eliminar regla de alarma
router.delete('/alarm-rule', checkAuth, async (req, res) => {
  try {
    const { emqxRuleId } = req.query;

    const r = await deleteAlarmRule(emqxRuleId);

    if (r) {
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

module.exports = router;
