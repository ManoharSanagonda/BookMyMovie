
function EmployeePayload() {
  return {
    getLoginEmployee(employee) {
      return {
        email: employee.getEmail(),
        password: employee.getPassword(),
        entityType: employee.getEntityType()
      }
    },

    getPostEmployee(employee) {
      return {
        firstName: employee.getFirstName(),
        lastName: employee.getLastName(),
        email: employee.getEmail(),
        phone: employee.getPhone()
      }
    }
  }
}


export default EmployeePayload;
