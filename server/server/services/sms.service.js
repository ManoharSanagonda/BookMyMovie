import Nexmo from 'nexmo';
import Plivo from 'plivo';


const nexmo = new Nexmo({
  apiKey: '171bea1e',
  apiSecret: 'qIL4bhgtGcCShG5E',
  options: {
    timeout: 60
  }
});

// const plivoclient = new Plivo.Client('MAMJKZYZA1MDM5MWIYNW', 'ZDgzYWZhNzBlMjJjMDA1ZTA4ZjI4YzdiYzlmY2Uz');


class SmsService {
  constructor() {
  }
  async  sendOtp(params) {
    if (global.settings && global.settings.enbaleSms) {
      if (global.settings.smsOption && global.settings.smsOption === "nexmo") {
        return await this.sendOtpUsingNexmo(params)
      }
    } else {
      return { error: "OK", message: "Sms Option ws disabled" }
    }
  }


  async sendOtpUsingNexmo(params) {
    return new Promise((resolve, reject) => {
      nexmo.verify.request({ number: params.to, brand: 'Project text', 'pin_expiry': 60, workflow_id: 4, next_event_wait: 60 }, (err, result) => {
        if (err) {
          resolve({
            error: 'OK',
            message: err
          });
        } else
          if (result.status === '0') {
            resolve({
              requestId: result.request_id,
              success: 'OK',
              type: "nexmo"
            });
          } else {
            resolve({
              message: result.error_text,
              error: 'OK'
            });
          }
      });
    })
  }


  async sendOtpUsing(params) {
    let randomNumber = await serviceUtil.generateRandomNumber(100000, 999999)
    return new Promise((resolve, reject) => {
      // plivoclient.messages.create(
      //   '+15488004092',
      //   '+' + params.to,
      //   'Your OTP Code For CashFinex Account Verificatio Is ' + randomNumber
      // ).then(function (err) {
      //   if (!err) {
      //     resolve({
      //       success: "OK",
      //       type: "plivo",
      //       otp: randomNumber
      //     })
      //   } else {
      //     resolve({
      //       error: 'OK'
      //     })
      //   }

      // })
    });
  }
}


export default SmsService