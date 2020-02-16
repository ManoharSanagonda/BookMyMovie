import expressValidation from 'express-validation';
import APIError from '../helpers/APIError';
import winstonInstance from './winston';

export default function (err, req, res) {
  let isStackError = false;
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    if (err.stack) {
      winstonInstance.info(err.stack);
    }
    isStackError = true;
    //    const error = new APIError(unifiedErrorMessage, err.status, true);
    //    return next(error);
  } else if (!(err instanceof APIError)) {
    if (err.stack) {
      winstonInstance.info(err.stack);
    }
    winstonInstance.info(err.message || "Internal server error");
    isStackError = true;
    //    const apiError = new APIError(err.message, err.status, err.isPublic);
    //    return next(apiError);
  }
  if (isStackError) {
    console.log(err)
    console.log(err.errors)
    let errorResponse = {
      errorCode: "9001",
      errorMessage: "Error has occured please contact Travel Guide support"
    }
    if (err.message) {
      errorResponse.messageType = err.message;
    }
    if (err.message && err.message === 'validation error') {
      let messages = [];
      if (err.errors.length > 0) {
        for (let errr of err.errors) {
          messages.push(errr.messages[0]);
        }
      }
      errorResponse.messages = messages;
    }
    return res.status(500).send(errorResponse);
  }
  return next(err);
};