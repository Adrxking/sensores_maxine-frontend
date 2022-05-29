// Modelos
import Data from '../models/data';

// Requerimientos
const express = require('express');

const router = express.Router();
const { checkAuth } = require('../middlewares/authentication');

router.get('/get-last-data', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;
    const { dId } = req.query;
    const { variable } = req.query;

    const data = await Data.find({ userId, dId, variable }).sort({ time: -1 }).limit(1);

    const response = {
      status: 'success',
      data,
    };

    return res.json(response);
  } catch (error) {
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.json(response);
  }
});

router.get('/get-small-charts-data', checkAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const userId = req.userData._id;
    const { chartTimeAgo } = req.query;
    const { dId } = req.query;
    const { variable } = req.query;

    const timeAgoMs = Date.now() - (chartTimeAgo * 60 * 1000);

    const data = await Data.find({
      userId, dId, variable, time: { $gt: timeAgoMs },
    }).sort({ time: 1 });

    const response = {
      status: 'success',
      data,
    };

    return res.json(response);
  } catch (error) {
    console.log(error);

    const response = {
      status: 'error',
      error,
    };

    return res.json(response);
  }
});

module.exports = router;
