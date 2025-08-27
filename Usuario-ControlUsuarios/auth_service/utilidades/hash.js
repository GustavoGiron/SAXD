const bcrypt = require('bcrypt');

const generarHash = async (contraseña) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contraseña, salt);
}

const compararHash = async (contraseña, hash) => {
    return await bcrypt.compare(contraseña, hash);
}

module.exports = { generarHash, compararHash };
