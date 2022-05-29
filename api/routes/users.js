// Modelos
import User from '../models/user';
import EmqxAuthRule from '../models/emqx_auth';

const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { checkAuth } = require('../middlewares/authentication');

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

// Tipos de credenciales MQTT: "user", "device", "superuser"
async function getWebUserMqttCredentials(userId) {
  try {
    const rule = await EmqxAuthRule.find({ type: 'user', userId });

    if (rule.length === 0) {
      const newRule = {
        userId,
        username: makeid(10),
        password: makeid(10),
        publish: [`${userId}/#`],
        subscribe: [`${userId}/#`],
        type: 'user',
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
      { type: 'user', userId },
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

async function getWebUserMqttCredentialsForReconnection(userId) {
  try {
    const rule = await EmqxAuthRule.find({ type: 'user', userId });

    if (rule.length === 1) {
      const toReturn = {
        username: rule[0].username,
        password: rule[0].password,
      };
      return toReturn;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

//* *****************
//* *** A P I *******
//* *****************

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const { password } = req.body;

    const user = await User.findOne({ email });

    // Si no hay email
    if (!user) {
      const response = {
        status: 'error',
        error: 'Invalid Credentials',
      };
      return res.status(401).json(response);
    }

    // if email and email ok
    if (bcrypt.compareSync(password, user.password)) {
      user.set('password', undefined, { strict: false });

      const token = jwt.sign({ userData: user }, 'securePasswordHere', {
        expiresIn: 60 * 60 * 24 * 30,
      });

      const response = {
        status: 'success',
        token,
        userData: user,
      };

      return res.json(response);
    }

    const response = {
      status: 'error',
      error: 'Invalid Credentials',
    };
    return res.status(401).json(response);
  } catch (error) {
    console.log(error);
  }
  return true;
});

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { name } = req.body;
    const { email } = req.body;
    const { password } = req.body;
    const encryptedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      name,
      email,
      password: encryptedPassword,
    };

    await User.create(newUser);

    const response = {
      status: 'success',
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - ENDPOINT REGISTRO');
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    console.log(response);

    return res.status(500).json(response);
  }
  return true;
});

// OBTENER CREDENCIALES WEB MQTT
router.post('/getmqttcredentials', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    const credentials = await getWebUserMqttCredentials(userId);

    const response = {
      status: 'success',
      username: credentials.username,
      password: credentials.password,
    };

    res.json(response);

    setTimeout(() => {
      getWebUserMqttCredentials(userId);
    }, 5000);

    return;
  } catch (error) {
    console.log(error);

    const response = {
      status: 'error',
    };

    // eslint-disable-next-line consistent-return
    return res.status(500).json(response);
  }
});

// OBTENER CREDENCIALES MQTT PARA RECONEXIÓN
router.post(
  '/getmqttcredentialsforreconnection',
  checkAuth,
  async (req, res) => {
    try {
      // eslint-disable-next-line no-underscore-dangle
      const userId = req.userData._id;
      const credentials = await getWebUserMqttCredentialsForReconnection(
        userId,
      );

      const response = {
        status: 'success',
        username: credentials.username,
        password: credentials.password,
      };

      console.log(response);
      res.json(response);

      setTimeout(() => {
        getWebUserMqttCredentials(userId);
      }, 15000);
    } catch (error) {
      console.log(error);
    }
  },
);

module.exports = router;
