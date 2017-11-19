module.exports = {
  nodemailer: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'foo@example.com',
      pass: '12345678',
    },
  },
  tor: {
    controlPassword: '12345678',
  },
}
