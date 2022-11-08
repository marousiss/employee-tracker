// Packages needed for this application
const inquirer = require('inquirer');
const cTable = require('console.table');
const dbQryFunc = require('./src/dbQueryFunctions');

// Clears the console
console.clear();

console.log("                           -------------------------------------------------");
console.log("                           |        Manage Employee Database               |");
console.log("                           -------------------------------------------------\n\n\n");



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
            const empResults = await dbQryFunc.getEmployees();
            const managers = await dbQryFunc.getManagers(empResults);
            await viewEmployees(empResults, managers);
            break;
        case "Add Employees":
            const roles = await dbQryFunc.getRoles();
            const employees = await dbQryFunc.getEmployees();
            const newEmployee = await getNewEmployee(roles, employees);
            await dbQryFunc.addEmployee(newEmployee);
            break;
        case "Update Employee Role":
            const roleNames = await dbQryFunc.getRoleNames();
            const emplNames = await dbQryFunc.getEmpNames();
            const empRole = await getEmplNewRole(roleNames, emplNames);
            const roleId = await dbQryFunc.getRoleId(empRole);
            await dbQryFunc.updateEmployeeRole(empRole, roleId);
            break;
        case "View All Roles":
            const roleResults = await dbQryFunc.getRoles();
            await viewRoles(roleResults);
            break;
        case "Add Role":
            const departs = await dbQryFunc.getDepartments();
            const newRole = await getNewRole(departs);
            const departmentId = await dbQryFunc.getDepartmentId(newRole.department);
            await dbQryFunc.addRole(newRole, departmentId);
            break;
        case "View All Departments":
            const depResults = await dbQryFunc.getDepartments();
            await viewDepartments(depResults);
            break;
        case "Add Department":
            const newDepartment = await getNewDepartment();
            await dbQryFunc.addDepartment(newDepartment);
            break;
    }

    startEmplMenu();
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

// View Roles
const viewRoles = (results) => {
    return new Promise((resolve, reject) => { 
        console.log("\n---EMPLOYEE ROLES===")
        console.log("\n" + cTable.getTable(results) + "\n");
        resolve();
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



//Function to get department name from the user input
const getNewDepartment = () => {

    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                name: 'department',
                message: 'What is the name of the department?',
                validate: (val) => dbQryFunc.valDepartment(val),
            }])
            .then((answer) => resolve(answer.department))
            .catch((error) => console.log(error));
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