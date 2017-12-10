module.exports = {
  nodemailer: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'foo@example.com',
      pass: '12345678',
    },
    defaultOptions: {
      from: 'Bar <bar@example.com>',
    },
  },
  tor: {
    controlPassword: '12345678',
  },
  notifyEmails: [ 'foobar@example.com' ],
  watchCourses: [
    { termId: 201820, courseId: 21967 },
  ],
  pollFrequency: 60 * 1000,
  heartbeatEmails: [
    'foobar@example.com',
  ],
  heartbeatFrequency: 24 * 60 * 60 * 1000,
}
