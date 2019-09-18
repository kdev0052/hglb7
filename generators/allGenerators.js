const passwordGen = require('./passwordGen')
const usernameGen = require('./usernameGen')
const nameGen = require('./nameGen')


const genPassword = () => passwordGen.generatePassword(12, true, true, true, true, true)

exports.firstName = nameGen.generateFirstName
exports.lastName = nameGen.generateLastName
exports.userName = usernameGen.generateUsername
exports.password = genPassword