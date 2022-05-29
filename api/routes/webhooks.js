import Data from '../models/data';
import Device from '../models/device';
import EmqxAuthRule from '../models/emqx_auth';
import Notification from '../models/notifications';
import AlarmRule from '../models/emqx_alarm_rule';
import Template from '../models/template';

const express = require('express');

const router = express.Router();
const mqtt = require('mqtt');
// eslint-disable-next-line no-unused-vars
const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const { checkAuth } = require('../middlewares/authentication');

let client;

//* *********************
//* ***** FUNCIONES *****
//* *********************

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function getDeviceMqttCredentials(dId, userId) {
  try {
    const rule = await EmqxAuthRule.find({
      type: 'device',
      userId,
      dId,
    });

    if (rule.length === 0) {
      const newRule = {
        userId,
        dId,
        username: makeid(10),
        password: makeid(10),
        publish: [`${userId}/${dId}/+/sdata`],
        subscribe: [`${userId}/${dId}/+/actdata`],
        type: 'device',
        time: Date.now(),
        updatedTime: Date.now(),
      };

      const result = await EmqxAuthRule.create(newRule);

      const toReturn = {
        username: result.username,
        password: result.password,
      };

      return toReturn;
    }

    const newUserName = makeid(10);
    const newPassword = makeid(10);

    const result = await EmqxAuthRule.updateOne(
      { type: 'device', dId },
      {
        $set: {
          username: newUserName,
          password: newPassword,
          updatedTime: Date.now(),
        },
      },
    );

    if (result.n === 1 && result.ok === 1) {
      return {
        username: newUserName,
        password: newPassword,
      };
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function startMqttClient() {
  const options = {
    port: 1883,
    host: process.env.EMQX_API_HOST,
    clientId:
      `webhook_superuser${Math.round(Math.random() * (0 - 10000) * -1)}`,
    username: process.env.EMQX_NODE_SUPERUSER_USER,
    password: process.env.EMQX_NODE_SUPERUSER_PASSWORD,
    keepalive: 60,
    reconnectPeriod: 5000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8',
  };

  client = mqtt.connect(`mqtt://${process.env.EMQX_API_HOST}`, options);

  client.on('connect', () => {
    console.log('MQTT CONNECTION -> SUCCESS;'.green);
    console.log('\n');
  });

  client.on('reconnect', (error) => {
    console.log('RECONNECTING MQTT');
    console.log(error);
  });

  client.on('error', (error) => {
    console.log('MQTT CONNECIONT FAIL -> ');
    console.log(error);
  });
}

function sendMqttNotif(notif) {
  const topic = `${notif.userId}/dummy-did/dummy-var/notif`;
  const msg = `The rule: when the ${
    notif.variableFullName
  } is ${
    notif.condition
  } than ${
    notif.value}`;
  client.publish(topic, msg);
}

// OBTENER TODAS LAS NOTIFICACIONES NO LEIDAS
async function getNotifications(userId) {
  try {
    const res = await Notification.find({ userId, readed: false });
    return res;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function saveNotifToMongo(incomingAlarm) {
  try {
    const newNotif = incomingAlarm;
    newNotif.time = Date.now();
    newNotif.readed = false;
    Notification.create(newNotif);
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
}

async function updateAlarmCounter(emqxRuleId) {
  try {
    await AlarmRule.updateOne(
      { emqxRuleId },
      { $inc: { counter: 1 } },
    );
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
}

setTimeout(() => {
  startMqttClient();
}, 3000);

// ******************
// **** A P I *******
// ******************

// WEBHOOK DE CREDENCIALES DEL DISPOSITIVO
router.post('/getdevicecredentials', async (req, res) => {
  try {
    const { dId } = req.body;

    const { password } = req.body;

    const device = await Device.findOne({ dId });

    if (password !== device.password) {
      return res.status(401).json();
    }

    const { userId } = device;

    const credentials = await getDeviceMqttCredentials(dId, userId);

    const template = await Template.findOne({ _id: device.templateId });

    const variables = [];

    template.widgets.forEach((widget) => {
      const v = (({
        variable,
        variableFullName,
        variableType,
        variableSendFreq,
      }) => ({
        variable,
        variableFullName,
        variableType,
        variableSendFreq,
      }))(widget);

      variables.push(v);
    });

    const response = {
      username: credentials.username,
      password: credentials.password,
      topic: `${userId}/${dId}/`,
      variables,
    };

    res.json(response);

    setTimeout(() => {
      getDeviceMqttCredentials(dId, userId);
      console.log('Device Credentials Updated');
    }, 10000);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
  return false;
});

// WEBHOOK DE GUARDADO
router.post('/saver-webhook', async (req, res) => {
  try {
    if (req.headers.token !== process.env.EMQX_API_TOKEN) {
      res.status(404).json();
      return;
    }

    const data = req.body;

    const splittedTopic = data.topic.split('/');
    const dId = splittedTopic[1];
    const variable = splittedTopic[2];

    const result = await Device.find({ dId, userId: data.userId });

    if (result.length === 1) {
      Data.create({
        userId: data.userId,
        dId,
        variable,
        value: data.payload.value,
        time: Date.now(),
      });
      console.log('Data created');
    }

    // eslint-disable-next-line consistent-return
    return res.status(200).json();
  } catch (error) {
    console.log(error);
    // eslint-disable-next-line consistent-return
    return res.status(500).json();
  }
});

// WEBHOOK DE ALARMAS
router.post('/alarm-webhook', async (req, res) => {
  try {
    if (req.headers.token !== process.env.EMQX_API_TOKEN) {
      res.status(404).json();
      return;
    }

    res.status(200).json();

    const incomingAlarm = req.body;

    updateAlarmCounter(incomingAlarm.emqxRuleId);

    const lastNotif = await Notification.find({
      dId: incomingAlarm.dId,
      emqxRuleId: incomingAlarm.emqxRuleId,
    })
      .sort({ time: -1 })
      .limit(1);

    if (lastNotif === 0) {
      console.log('FIRST TIME ALARM');
      saveNotifToMongo(incomingAlarm);
      sendMqttNotif(incomingAlarm);
    } else {
      const lastNotifToNowMins = (Date.now() - lastNotif[0].time) / 1000 / 60;

      if (lastNotifToNowMins > incomingAlarm.triggerTime) {
        console.log('TRIGGERED');
        saveNotifToMongo(incomingAlarm);
        sendMqttNotif(incomingAlarm);
      }
    }
  } catch (error) {
    console.log(error);
    // eslint-disable-next-line consistent-return
    return res.status(500).json();
  }
});

// OBTENER NOTIFICACIONES
router.get('/notifications', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    const notifications = await getNotifications(userId);

    const response = {
      status: 'success',
      data: notifications,
    };

    res.json(response);
  } catch (error) {
    console.log('ERROR GETTING NOTIFICATIONS');
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
  return false;
});

// ACTUALIZAR NOTIFICACIÓN (estado de lectura)
router.put('/notifications', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    const notificationId = req.body.notifId;

    await Notification.updateOne(
      { userId, _id: notificationId },
      { readed: true },
    );

    const response = {
      status: 'success',
    };

    res.json(response);
  } catch (error) {
    console.log('ERROR UPDATING NOTIFICATION STATUS');
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
  return false;
});

module.exports = router;
