import nodemailer from 'nodemailer';
import ses from 'node-ses';

import config from '../config/config';

import Template from '../models/templates.model';

import SendGridService from './sendgrid.service';

import serviceUtil from '../utils/service.util';

const sendGridService = new SendGridService();

// initialize smtp taransport 
let smtpTransport;
if (config && config.mailSettings && config.mailSettings.mailType) {
  if (config.mailSettings.mailType === 'ses') {
    if (config.mailSettings.sesEmailSettings && config.mailSettings.sesEmailSettings.key && config.mailSettings.sesEmailSettings.secret) {
      smtpTransport = ses.createClient({
        key: config.mailSettings.sesEmailSettings.key,
        secret: config.mailSettings.sesEmailSettings.secret
      });
    }
  } else if (config.mailSettings.mailType === 'smtp') {
    if (config.mailSettings.smtpOptions) {
      smtpTransport = nodemailer.createTransport(config.mailSettings.smtpOptions);
    }
  } else if (config.mailSettings.mailType === 'gmail') {
    if (config.mailSettings.gmailOptions) {
      smtpTransport = nodemailer.createTransport(config.mailSettings.gmailOptions);
    }
  } else if (config.mailSettings.mailType === 'zoho') {
    if (config.mailSettings.zohoEmailOptions) {
      smtpTransport = nodemailer.createTransport(config.mailSettings.zohoEmailOptions);
    }
  }
}


class EmailService {
  constructor() {

  }
  /**
   * modify template text to html
   * @param template
   * @param emailParams
   */
  modifyTemplateTextToHtml(template, emailParams) {
    var templateFnDesc = serviceUtil.camelize(template.name);
    let templateFns = {
      forgetPassword: () => {
        return template.templateText
          .replace(/###USERNAME###!/g, emailParams.userName)
          .replace(/###LINK###/g, emailParams.link)
      },
      adminForgetPassword: () => {
        return template.templateText
          .replace(/###DISPLAYNAME###!/g, emailParams.displayName)
          .replace(/###LINK###/g, emailParams.link)
      },
      welcomeUser: () => {
        return template.templateText
          .replace(/###USERNAME###!/g, emailParams.userName)
          .replace(/###EMAIL/g, emailParams.email)
          .replace(/###LINK###/g, emailParams.link)
      },
      employeeWelcome: () => {
        return template.templateText
          .replace(/###DISPLAYNAME###!/g, emailParams.displayName)
          .replace(/###ID###/g, emailParams.Id)
          .replace(/###LINK###/g, emailParams.link)
      },
      authenticationUser: () => {
        return template.templateText
          .replace(/###USERNAME###!/g, emailParams.userName)
          .replace(/###OTP/g, emailParams.otp)
      },
    };

    return {
      init: () => {
        return templateFns[templateFnDesc]();
      }
    };
  }

  /**
   * send Email via grid
   * @param req
   */
  async sendEmailviaGrid(req) {
    let template = await Template.findUniqueTemplate(req.templateName);
    if (template) {
      let params = {
        to: req.emailParams.to,
        subject: template.subject,
        html: ''
      };
      params.html = this.modifyTemplateTextToHtml(template, req.emailParams).init();

      sendGridService.send({ params });
    }
  }

  async sendEmailviaGrid(req) {
    let settings = await Setting.findOne({ active: true });
    let template = await Template.findUniqueTemplate(req.templateName);
    if (template) {
      let params = {
        to: req.emailParams.to,
        subject: template.subject,
        html: ''
      };
      params.html = this.modifyTemplateTextToHtml(template, req.emailParams).init();
      if (settings && settings.enableMails) {
        if (settings.emailSourceType === 'nodeMailer' && settings.sendGridEmail) {
          params.form = settings.sendGridEmail;
          smtpTransport.sendMail(params, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('Email sent successfully.');
            }
          });
        } else {
          sendGridService.send({ params });
        }
      } else {
        console.log("Emails disabaled");
      }
    }
  }
  /**
* Create a record for email vrefiy for user
*/
  async createEmailVerfiyRecord(req, { type, login }) {
    let emailVerify = new EmailVerify();
    let expireTime = 60;
    let settings = await Settings.findOne({ active: true });
    if (type === 'userActive') {
      expireTime = settings.activeEmailExpireInMin || 10
    } else if (type === 'forgotPassword') {
      expireTime = settings.forgotEmailExpireInMin || 5
    }

    emailVerify.token = req.token;
    emailVerify.type = type;
    emailVerify.email = req.email;
    emailVerify.login = login;
    emailVerify.createdTimeStamp = (new Date()).getTime();
    emailVerify.expireTimeStamp = emailVerify.createdTimeStamp + (expireTime * 60 * 1000);
    await EmailVerify.save(emailVerify);
  }

}

export default EmailService;
