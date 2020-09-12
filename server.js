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
    }})
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
