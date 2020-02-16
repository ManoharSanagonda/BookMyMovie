
import sessionUtill from '../utils/session.util';
class UserService {
    constructor() {

    }

    /**
     * Set the user variables while creating
     */
    async setCreateUserVariables(req, user) {
        user.displayName = " ";
        if (req.body.firstName) {
            user.displayName += req.body.firstName + " ";
        }
        if (req.body.lastName) {
            user.displayName += req.body.lastName;
        }
        if (sessionUtill.checkTokenInfo(req, "_id")) {
            user.createdBy[sessionUtill.getLoginType(req)] = sessionUtill.getSessionLoginID(req);
            user.createdByName = sessionUtill.getSessionLoginName(req);
        }
        user.status = "Pending";
        return user;
    }

    /**
     * Set the user variables while updating
     */
    async setUpdateUserVariables(req, user) {
        user.displayName = " ";
        if (req.body.firstName) {
            user.displayName += req.body.firstName + " ";
        }
        if (req.body.lastName) {
            user.displayName += req.body.lastName;
        }
        if (sessionUtill.checkTokenInfo(req, "_id")) {
            user.updatedBy[sessionUtill.getLoginType(req)] = sessionUtill.getSessionLoginID(req);
        }
        user.updated = new Date();

        if (req.body.status && req.body.status === 'Inactive') {
            user.disabledDate = new Date();
        }
        return user;
    }
}

export default UserService;