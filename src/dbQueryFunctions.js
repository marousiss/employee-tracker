const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // MySQL password
        password: 'passabc',
        //database: 'employee_db'
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

// Function to get alll employees from the database
const getEmployees = () => {

    const emplQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS "department", role.salary, employee.manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON department.id = role.department_id`;

    return new Promise((resolve, reject) => {
        db.query(emplQuery, (err, results) => {
            if (!err) {
                resolve(results);
            } else {
                throw err;
            }
        });
    });
}

const getEmpNames = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name FROM employee`, (err, results) => {
            if (!err) {
                let empNames = [];
                results.forEach(employee => empNames.push(employee.name));
                resolve(empNames);
            } else {
                throw err;
            }
        });
    });
}

const getManagers = (employees) => {

    const managerQuery = ` SELECT CONCAT(m.first_name, ' ', m.last_name) AS employee , CONCAT(e.first_name, ' ', e.last_name) as manager FROM employee e RIGHT JOIN employee m ON m.manager_id = e.id`;

    return new Promise((resolve, reject) => {
        db.query(managerQuery, (err, results) => {
            if (!err) {
                resolve(results);
            } else {
                throw err;
            }
        });
    });

}

//Function to add an employee to database
const addEmployee = (newEmployee) => {

    return new Promise((resolve, reject) => {
        const emplQuery = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${newEmployee.firstName}', '${newEmployee.lastName}', ${newEmployee.roleId}, ${newEmployee.managerId})`;

        db.query(emplQuery, (err, results) => {

            if (!err) {
                console.log(`\n${newEmployee.firstName} ${newEmployee.lastName} added to the database.\n`);
                resolve();
            } else {
                console.log(err);
                throw err;
            }
        });
    });
}

const updateEmployeeRole = (empRole, roleId) => {

    const nameArr = empRole.employee.split(" ");
    const firstName = nameArr[0];
    const lastName = nameArr[1];
    let rlId = roleId[0].id;
    
    const updateRoleQuery = `UPDATE employee SET employee.role_id = ${rlId} WHERE employee.first_name = "${firstName}" AND employee.last_name = "${lastName}"`;
    return new Promise((resolve, reject) => {
        db.query(updateRoleQuery, (err, results) => {
            if (!err) {
                console.log(`\nUpdated employee's role.\n`);
                resolve();
            } else {
                console.log(err);
                throw err;
            }
        });
    });
}

// Get all Roles from database
const getRoles = () => {
    const roleQuery = `SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON department.id = role.department_id`;
    return new Promise((resolve, reject) => { 
        db.query(roleQuery, (err, results) => {
            if (!err) {
                resolve(results);
            } else {
                throw err;
            }
        })
    });
}

// Function to get role titles
const getRoleNames = () => {
    return new Promise((resolve, reject) => { 
        db.query(`SELECT DISTINCT role.title FROM role`, (err, results) => {
            if (!err) {
                let roleNames = [];
                results.forEach(role => roleNames.push(role.title));
                resolve(roleNames);
            } else {
                throw err;
            }
        })
    });
}

// Function to get role id 
const getRoleId = (empRole) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT role.id FROM role WHERE role.title = "${empRole.role}"`, (err, results) => {
            if (!err) {
                resolve(results);
            } else {
                throw err;
            }
        })
    });
}

//Function to add a role to the database
const addRole = (newRole, depId) => {

    return new Promise((resolve, reject) => {
        const salary = parseInt(newRole.salary);
        const roleQuery = `INSERT INTO role (title, salary, department_id) VALUES ('${newRole.title}', ${salary}, ${depId})`;

        db.query(roleQuery, (err, results) => {
            if (!err) {
                console.log(`\n${newRole.title} added to the database.\n`);
                resolve();
            } else {
                reject(err);
            }
        });
    });
}


// Function to get all departments from the database table 
const getDepartments = () => {
    return new Promise((resolve, reject) => { 
        db.query('SELECT * FROM department', (err, results) => {
            if (!err) {    
                resolve(results);
            } else {
                reject('error: Something went wrong.');
            }
        })
    });
}

// Function to get department id 
const getDepartmentId = (department) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT id FROM department WHERE name = '${department}'`, (err, results) => {
            if (!err) {
                resolve(results[0].id);    
            } else {
                reject(err);
            }
        });
    });
}

// Function to add department to database
const addDepartment = (department) => {
    
    return new Promise((resolve, reject) => {
        const depQuery = `INSERT INTO department (name) VALUES ('${department}')`;
        db.query(depQuery, (err, results) => {
            if (!err) {
                console.log(`\n${department} added to the database.\n`);
                resolve();
            } else {
                throw err;
            }
        })
    });       
}

// Function to validate user input department name
const valDepartment = (val) => {
    return new Promise((resolve, reject) => {
        if (!val) {
            console.log("Please enter a valid value");
            reject(false);
        } else {
            // Check if department already in table
            const depQuery = `SELECT name FROM department WHERE name = '${val}'`;
            db.query(depQuery, (err, results) => {
                if (!err) {
                    if (results.length > 0) {
                        // department already in table
                        console.log(" - Department already in table. Please add a new department");
                        reject(false);
                    }
                    resolve(true);
                } else {
                    console.log("something went wrong while reading department table\n" + err);
                    reject(false);
                }
            })
        }
    });
}


module.exports = {
    getEmployees,
    getEmpNames,
    getManagers,
    addEmployee,
    updateEmployeeRole,
    getRoles,
    getRoleNames,
    getRoleId,
    addRole,
    getDepartments,
    getDepartmentId,
    addDepartment,
    valDepartment,

}

