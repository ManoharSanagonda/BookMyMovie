
import sessionUtill from '../utils/session.util';
class EmployeeService {
    constructor() {

    }

    /**
     * Set the employee variables while creating
     */
    async setCreateEmployeeVariables(req, employee) {
        employee.displayName = " ";
        if (req.body.firstName) {
            employee.displayName += req.body.firstName + " ";
        }
        if (req.body.lastName) {
            employee.displayName += req.body.lastName;
        }
        if (sessionUtill.checkTokenInfo(req, "_id")) {
            employee.createdBy.employee = sessionUtill.getSessionLoginID(req);
            employee.createdByName = sessionUtill.getSessionLoginName(req);
        }
        employee.status = "Pending";
        return employee;
    }

    /**
     * Set the employee variables while updating
     */
    async setUpdateEmployeeVariables(req, employee) {
        employee.displayName = " ";
        if (req.body.firstName) {
            employee.displayName += req.body.firstName + " ";
        }
        if (req.body.lastName) {
            employee.displayName += req.body.lastName;
        }
        if (sessionUtill.checkTokenInfo(req, "_id")) {
            employee.updatedBy.employee = sessionUtill.getSessionLoginID(req);
        }
        employee.updated = new Date();

        if (req.body.status && req.body.status === 'Inactive') {
            employee.disabledDate = new Date();
        }
        return employee;
    }
}

export default EmployeeService;