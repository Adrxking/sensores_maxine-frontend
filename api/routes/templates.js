// Modelos
import Template from '../models/template';
import Device from '../models/device';

// Requerimientos
const express = require('express');

const router = express.Router();
const { checkAuth } = require('../middlewares/authentication');

// Obtener plantillas
router.get('/template', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    const templates = await Template.find({ userId });

    console.log(userId);
    console.log(templates);

    const response = {
      status: 'success',
      data: templates,
    };

    return res.json(response);
  } catch (error) {
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
});

// Crear plantilla
router.post('/template', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;

    const newTemplate = req.body.template;

    newTemplate.userId = userId;
    newTemplate.createdTime = Date.now();

    await Template.create(newTemplate);

    const response = {
      status: 'success',
    };

    return res.json(response);
  } catch (error) {
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
});

// Eliminar plantilla
router.delete('/template', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;
    const { templateId } = req.query;

    const devices = await Device.find({ userId, templateId });

    if (devices.length > 0) {
      const response = {
        status: 'fail',
        error: 'template in use',
      };

      return res.json(response);
    }

    await Template.deleteOne({ userId, _id: templateId });

    const response = {
      status: 'success',
    };

    return res.json(response);
  } catch (error) {
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.status(500).json(response);
  }
});

module.exports = router;
