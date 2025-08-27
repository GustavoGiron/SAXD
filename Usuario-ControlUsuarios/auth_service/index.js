const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRutas = require('./rutas/auth');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRutas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
