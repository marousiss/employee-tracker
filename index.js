// Packages needed for this application
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Clears the console
console.clear();

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

const processSelection = async (userChoice) => {

    switch (userChoice) {
        case "View All Employees":
            await displayEmployees();
            //startEmplMenu();
        case "Add Employees":
            console.log(userChoice);
            break;
        case "Update Employee Role":
            console.log(userChoice);
            break;
        case "View All Roles":
            await displayRoles();
            //startEmplMenu();
        case "Add Role":
            console.log(userChoice);
            break;
        case "View All Departments":
            await displayDepartments();
            //startEmplMenu();
        case "Add Department":
            console.log(userChoice);
            break;
    }
    startEmplMenu();
}


// Display Employees
const displayEmployees = () => {
    return new Promise((resolve, reject) => {
        emplQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON department.id = role.department_id`;
        
        db.query(emplQuery, (err, results) => {
            if (!err) {
                
                console.log("\n---EMPLOYEES---")
                console.log("\n" + cTable.getTable(results) + "\n");
                return resolve(true);
            } else {
                return reject('error: Something went wrong.');
            }
        })
    });
}

// Display Roles
const displayRoles = () => {
    
    return new Promise((resolve, reject) => { 

        const roleQuery = `SELECT role.id, role.title, department.name, role.salary FROM role JOIN department ON department.id = role.department_id`;

        db.query(roleQuery, (err, results) => {
            if (!err) {
                // Display role table data
                console.log("\n---EMPLOYEE ROLES===")
                console.log("\n" + cTable.getTable(results) + "\n");
                resolve();
            } else {
                reject('error: Something went wrong.');
            }
        })
    });
}

const displayDepartments = () => {
    return new Promise((resolve, reject) => { 
        db.query('SELECT * FROM department', (err, results) => {
            if (!err) {
                // Display role table data
                //const table = cTable.getTable(results);
                console.log("\n--- DEPARTMENTS---");
                console.log("\n" + cTable.getTable(results) + "\n");
                resolve();
            } else {
                reject('error: Something went wrong.');
            }
        })
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
                //userChoice = answer.userChoice;
                resolve(answer.userChoice);
            })
            .catch((error) => {
                reject(error);
            });

    });
}

startEmplMenu();