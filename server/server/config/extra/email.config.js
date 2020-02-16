const mailConfig = {
  mailSettings: {
    adminUrl: 'http://localhost:4500/',
    clientUrl: 'http://localhost:4200/',
    serverUrl: 'http://localhost:3000/api/',
    websiteName: 'project',
    mailType: 'gmail',
    activateMails: true,
    from: 'projectname <email>',
    smtpOptions: {
      host: 'smtp.soteria.local',
      port: 25,
      secure: false,
      ignoreTLS: true
    },
    gmailOptions: {
      service: 'Gmail',
      auth: {
        user: 'email', // Your email id
        pass: 'password' // Your password
      }
    },
    sesEmailSettings: {
      key: 'xxxxxxxxxxxxxx',
      secret: 'xxxxxxxxxxxxxxxxxxxxxx'
    }
  }
};

export default mailConfig;