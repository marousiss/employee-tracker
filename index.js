// Packages needed for this application
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Clears the console
console.clear();

console.log("                           -------------------------------------------------");
console.log("                           |        Manage Employee Database               |");
console.log("                           -------------------------------------------------\n\n\n");

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


// Function to get the user's input and do accordingly
function startEmplMenu() {
    getMenuChoice()
        .then((userChoice) => {
            if (userChoice === "Quit") {
                console.log('\n' + "you chose to quit. \nBye." + '\n');
                process.exit(0);
            }
            processSelection(userChoice);
        })
        .catch((err) => {
            console.log(err);
        });
}

// Function to process user's input selection
const processSelection = async (userChoice) => {

    switch (userChoice) {
        case "View All Employees":
            const empResults = await getEmployees();
            const managers = await getManagers(empResults);
            await viewEmployees(empResults, managers);
            break;
        case "Add Employees":
            const roles = await getRoles();
            const employees = await getEmployees();
            const newEmployee = await getNewEmployee(roles, employees);
            await addEmployee(newEmployee);
            break;
        case "Update Employee Role":
            const roleNames = await getRoleNames();
            const emplNames = await getEmpNames();
            const empRole = await getEmplNewRole(roleNames, emplNames);
            const roleId = await getRoleId(empRole);
            await updateEmployeeRole(empRole, roleId);
            break;
        case "View All Roles":
            const roleResults = await getRoles();
            await viewRoles(roleResults);
            break;
        case "Add Role":
            const departs = await getDepartments();
            const newRole = await getNewRole(departs);
            const departmentId = await getDepartmentId(newRole.department);
            await addRole(newRole, departmentId);
            break;
        case "View All Departments":
            const depResults = await getDepartments();
            await viewDepartments(depResults);
            break;
        case "Add Department":
            const newDepartment = await getNewDepartment();
            await addDepartment(newDepartment);
            break;
    }

    startEmplMenu();
}

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


// View Employees
const viewEmployees = (employees, managers) => {

    let results = [];
    employees.forEach(employee => {
        
        let managerFound = managers.find(manager => manager.employee == employee.first_name + ' ' + employee.last_name );
        if (!managerFound) {
            managerFound.manager = null;
        }  
        
        const empl = {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            title: employee.title,
            department: employee.department,
            salary: employee.salary,
            manager: managerFound.manager,
        };
        results.push(empl);
    })
    
    return new Promise((resolve, reject) => {
        console.log("\n---EMPLOYEES---")
        console.log("\n" + cTable.getTable(results) + "\n");
        resolve();
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

// Function to get the role titles
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

// Function to get the role id 
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

// View Roles
const viewRoles = (results) => {
    return new Promise((resolve, reject) => { 
        console.log("\n---EMPLOYEE ROLES===")
        console.log("\n" + cTable.getTable(results) + "\n");
        resolve();
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

// View Departments
const viewDepartments = (results) => {
    return new Promise((resolve, reject) => {
        console.log("\n--- DEPARTMENTS---");
        console.log("\n" + cTable.getTable(results) + "\n");
        resolve();
    });
}

// Function to get new employee from user's input
const getNewEmployee = (roles, employees) => {

    let roleTitles = [];
    //create array of role titles
    roles.forEach(role => {
        if (!roleTitles.includes(role.title)) {
            roleTitles.push(role.title);
        }
    });

    let manNames = [];
    //create array of employees name
    employees.forEach(employee => { 
        manNames.push(employee.first_name + ' ' + employee.last_name);
    });


    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: "input",
                    name: 'firstName',
                    message: "What is the employee's first name?",
                },
                {
                    type: "input",
                    name: 'lastName',
                    message: "What is the employee's last name?",
                },
                {
                    type: "list",
                    name: 'roleTitle',
                    message: "What is the employee's role?",
                    choices: roleTitles,
                },
                {
                    type: "list",
                    name: 'manager',
                    message: "What is the employee's manager?",
                    choices: manNames,
                },
            ])
            .then((answer) => {
                //get role id
                const role = roles.find(role => role.title === answer.roleTitle);

                const nameArr = answer.manager.split(" ");
                //get manager id
                const manager = employees.find(employee => 
                    employee.first_name == nameArr[0] && employee.last_name == nameArr[1]);

                //build new employee
                const newEmployee = {
                    firstName: answer.firstName,
                    lastName: answer.lastName,
                    roleId: role.id,
                    managerId: manager.id,
                }

                resolve(newEmployee);
            })
            .catch((error) => console.log(error));
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

//Function to get employees new role from user's input
const getEmplNewRole = (roleNames, empNames) => {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Which employee?",
                    choices: empNames,
                },
                {
                    type: "list",
                    name: "role",
                    message: "What role?",
                    choices: roleNames,
                }
            ])
            .then((answer) => resolve(answer))
            .catch((err) => console.log(err));
    });
}

const updateEmployeeRole = (empRole, roleId) => {

    const nameArr = empRole.employee.split(" ");
    const firstName = nameArr[0];
    const lastName = nameArr[1];
    let rlId = roleId[0].id;
    
    const updateRoleQuery = `UPDATE employee SET employee.role_id = ${rlId} WHERE employee.first_name = "${firstName}" AND employee.last_name = "${lastName}"`;
    return new Promise((resolve, reject) => {
        //resolve();
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

// Function to get role from user's input
const getNewRole = (departs) => {

    let departments = [];
    // create array of departments
    departs.forEach(department => {
        departments.push(department.name); 
    });

    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: "input",
                name: "title",
                message: "What is the name of the role?",
                },
                {
                    type: "input",
                    name: 'salary',
                    message: "What is the salary of the role?",
                },
                {
                    type: "list",
                    name: "department",
                    message: "What department does the role belong to?",
                    choices: departments,
                }
            ])
            .then((answer) => resolve(answer))
            .catch((error) => console.log(error));
    });
}


//Function to add arole to the database
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

//Function to get department name from the user input
const getNewDepartment = () => {

    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                name: 'department',
                message: 'What is the name of the department?',
                validate: (val) => valDepartment(val),
            }])
            .then((answer) => resolve(answer.department))
            .catch((error) => console.log(error));
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


function getMenuChoice() {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'list',
                name: 'userChoice',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'Add Employees', 'Update Employee Role',
                'View All Roles', 'Add Role', 'View All Departments', 'Add Department',
                'Quit']
            }])
            .then((answer) => {
                resolve(answer.userChoice);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

startEmplMenu();