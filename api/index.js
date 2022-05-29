// Requeridos
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

require('dotenv').config();

// Instancias
const app = express();

// Configuración Express
app.use(morgan('tiny'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cors());

// Rutas
app.use('/api', require('./routes/devices'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/templates'));
app.use('/api', require('./routes/webhooks'));
app.use('/api', require('./routes/emqxapi'));
app.use('/api', require('./routes/alarms'));
app.use('/api', require('./routes/dataprovider'));

module.exports = app;

// Listener
app.listen(process.env.API_PORT, () => {
  console.log(`Servidor API escuchando en el puerto ${process.env.API_PORT}`);
});

if (process.env.SSLREDIRECT === 'true') {
  const app2 = express();

  app2.listen(3002, () => {
    console.log('Listening on port 3002 (for redirect to ssl)');
  });

  app2.all('*', (req, res) => {
    console.log('NO SSL ACCESS ... Redireccionando...');
    return res.redirect(`https://${req.headers.host}${req.url}`);
  });
}

// Conexión Mongo
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

const uri = `mongodb://${
  mongoUserName
}:${
  mongoPassword
}@${
  mongoHost
}:${
  mongoPort
}/${
  mongoDatabase}`;

console.log(uri);

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  authSource: 'admin',
};

mongoose.connect(uri, options).then(
  () => {
    console.log('\n');
    console.log('*******************************'.green);
    console.log('✔ Mongo Successfully Connected!'.green);
    console.log('*******************************'.green);
    console.log('\n');
    global.check_mqtt_superuser();
  },
  (err) => {
    console.log('\n');
    console.log('*******************************'.red);
    console.log('    Mongo Connection Failed    '.red);
    console.log('*******************************'.red);
    console.log('\n');
    console.log(err);
  },
);
