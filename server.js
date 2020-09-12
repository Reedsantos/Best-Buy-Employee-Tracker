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
};
