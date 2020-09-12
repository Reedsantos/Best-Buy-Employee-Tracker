const inquirer = require("inquirer");
const mysql = require('mysql');
const cTable = require('console.table');
const clear = require('console-clear');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "employeesdb"
});

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
    startApp()
});

function startApp() {
    clear();
    startPrompt();
}

function renderScreen(tableTitle, tableData) {
    clear();
    console.log((tableTitle));
    console.table(tableData);
    startPrompt();
}

function startPrompt() {
    console.log("\n Welcome To The Best Buy Retail Employee Tracker! \n");
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Make a selection:",
            choices: [
                "View Employees",
                "Sort Employees by Manager",
                "Show Roles",
                "Show Departments",
                "Add Employee",
                "Add Role",
                "Add Departments",
                "Remove Employee",
                "Remove Role",
                "Remove Department"]
        })

        .then(answer => {
            switch (answer.promptChoice) {
                case "View Employees":
                    viewEmployees();
                    break;

                case "Sort Employees by Manager":
                    sortManagers();
                    break;

                case "Show Roles":
                    viewRoles();
                    break;

            }
        })
};

function viewEmployees() {
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON department.id = role.department_id
	LEFT JOIN employee as manager ON employee.manager_id = manager.id;`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({
                "ID": res[i].id,
                "First Name": res[i].first_name,
                "Last Name": res[i].last_name,
                "Role": res[i].title,
                "Salary": res[i].salary,
                "Department": res[i].department_name,
                "Manager": res[i].manager_full_name
            });
        }
        renderScreen("All Employees", tableData);
    });
}

function sortManagers() {
    const query = `
    SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name
    FROM employee
    LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        const managers = [];
        for (let i = 0; i < res.length; i++) {
            managers.push(res[i].full_name);
        }
        promptManagers(managers);
    });
}
function promptManagers(managers) {
    inquirer
        .prompt({
            type: "list",
            name: "promptChoice",
            message: "Select Manager:",
            choices: managers
        })
        .then(answer => {
            querymanagers(answer.promptChoice);
        });
}

function querymanagers(manager) {
    const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department_name, concat(manager.first_name, " ", manager.last_name) AS manager_full_name 
    FROM employee 
    INNER JOIN role ON employee.role_id = role.id
    INNER JOIN employee AS manager ON employee.manager_id = manager.id
    INNER JOIN department ON department.id = role.department_id
    WHERE concat(manager.first_name, " ", manager.last_name) = "${manager}";`;

    connection.query(query, (err, res) => {
        if (err) throw err;
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({
                "ID": res[i].id,
                "First Name": res[i].first_name,
                "Last Name": res[i].last_name,
                "Role": res[i].title,
                "Salary": res[i].salary,
                "Department": res[i].department_name
            });
        }
        renderScreen(`These employees are managed by ${manager}`, tableData);
    });
}

function viewRoles() {
    const query = `SELECT id, title FROM employeesdb.role;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({
                "ID": res[i].id,
                "Roles": res[i].title
            });
        }
        renderScreen("All Roles", tableData);
    });
}
