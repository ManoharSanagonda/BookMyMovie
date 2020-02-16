import sgMail from '@sendgrid/mail';
import settings from '../models/settings.model';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
class sendGridService {
  constructor() {

  }
  async  send({ params }) {
    if (settings && settings.enableMails) {
      if (settings.sendGridApiKey && settings.sendGridEmail) {
        sgMail.setApiKey(settings.sendGridApiKey);
        params.from = settings.sendGridEmail;
        sgMail.send(params, (err) => {
          if (err) {
            console.log('Error', err);
          } else {
            console.log("Email send successfully")
          }
        });
      } else {
        console.log("Check settings for sendGridApiKey and sendGridEmail");
      }
    }
    else {
      console.log("Emails disabaled")
    }
  }
}

export default sendGridService;