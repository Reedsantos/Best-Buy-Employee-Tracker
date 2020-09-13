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

                case "Show Departments":
                    viewDepartments();
                    break;

                case "Add Employee":
                    addEmployee();
                    break;

                case "Add Role":
                    addRole();
                    break;

                case "Add Departments":
                    addDepartment();
                    break;

                case "Remove Employee":
                    removeEmployee();
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

function viewDepartments() {
    const query = `SELECT id, department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        const tableData = [];
        for (let i = 0; i < res.length; i++) {
            tableData.push({
                "ID": res[i].id,
                "Departments": res[i].name
            });
        }
        renderScreen(`All Departments`, tableData);
    });
}
function addEmployee() {
    const newEmployee = {
        firstName: "",
        lastName: "",
        roleID: 0,
        managerID: 0
    };
    inquirer
        .prompt([{
            name: "firstName",
            message: "Enter employee's first name: ",
            validate: async (input) => {
                return true;
            }
        }, {
            name: "lastName",
            message: "Enter employee's last name: ",
            validate: async (input) => {
                return true;
            }
        }])
        .then(answers => {
            newEmployee.firstName = answers.firstName;
            newEmployee.lastName = answers.lastName;
            const query = `SELECT role.title, role.id FROM role;`;
            connection.query(query, (err, res) => {
                if (err) throw err;
                const roles = [];
                const rolesNames = [];
                for (let i = 0; i < res.length; i++) {
                    roles.push({
                        id: res[i].id,
                        title: res[i].title
                    });
                    rolesNames.push(res[i].title);
                }
                inquirer
                    .prompt({
                        type: "list",
                        name: "rolePromptChoice",
                        message: "Select Role:",
                        choices: rolesNames
                    })
                    .then(answer => {
                        const chosenRole = answer.rolePromptChoice;
                        let chosenRoleID;
                        for (let i = 0; i < roles.length; i++) {
                            if (roles[i].title === chosenRole) {
                                chosenRoleID = roles[i].id;
                            }
                        }
                        newEmployee.roleID = chosenRoleID;

                        const query = `
                    SELECT DISTINCT concat(manager.first_name, " ", manager.last_name) AS full_name, manager.id
                    FROM employee
                    LEFT JOIN employee AS manager ON manager.id = employee.manager_id;`;
                        connection.query(query, (err, res) => {
                            if (err) throw err;
                            const managers = [];
                            const managersNames = [];
                            for (let i = 0; i < res.length; i++) {
                                managersNames.push(res[i].full_name);
                                managers.push({
                                    id: res[i].id,
                                    fullName: res[i].full_name
                                });
                            }
                            inquirer
                                .prompt({
                                    type: "list",
                                    name: "managerPromptChoice",
                                    message: "Select Manager:",
                                    choices: managersNames
                                })
                                .then(answer => {
                                    const chosenManager = answer.managerPromptChoice;
                                    let chosenManagerID;
                                    for (let i = 0; i < managers.length; i++) {
                                        if (managers[i].fullName === chosenManager) {
                                            chosenManagerID = managers[i].id;
                                            break;
                                        }
                                    }
                                    newEmployee.managerID = chosenManagerID;
                                    const query = "INSERT INTO employee SET ?";
                                    connection.query(query, {
                                        first_name: newEmployee.firstName,
                                        last_name: newEmployee.lastName,
                                        role_id: newEmployee.roleID || 0,
                                        manager_id: newEmployee.managerID || 0
                                    }, (err, res) => {
                                        if (err) throw err;
                                        console.log("Employee Added");
                                        setTimeout(viewEmployees, 500);
                                    });
                                });
                        });
                    });
            });
        });
};

function addDepartment() {
    inquirer
        .prompt([
            {
                name: "deptName",
                type: "input",
                message: "Enter new Department title:",
            },
        ])
        .then((answer) => {
            const query = `INSERT INTO department (name) VALUES (?);`;
            connection.query(query, [answer.deptName], (err, res) => {
                if (err) throw err;
                console.log("  New Department has been successfully added!")
                departmentsCb(function (departments) {
                    renderScreen("departments", departments);
                })
            })

        });
}
function departmentsCb(callback) {
    const query = `SELECT department.name FROM department;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        const departments = [];
        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }
        callback(departments)
    });
};

function addRole() {
    const departments = [];
    const departmentsName = [];
    const query = `SELECT id, name FROM department`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            departments.push({
                id: res[i].id,
                name: res[i].name
            });
            departmentsName.push(res[i].name);
        }
        inquirer
            .prompt([
                {
                    name: "rName",
                    type: "input",
                    message: "Enter new role title:",
                },
                {
                    name: "salNum",
                    type: "input",
                    message: "Enter role salary:",
                },
                {
                    type: "list",
                    name: "roleDept",
                    message: "Select department:",
                    choices: departmentsName
                },
            ])
            .then((answer) => {

                let deptID = departments.find((obj) => obj.name === answer.roleDept).id;
                connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                    [answer.rName, answer.salNum, deptID], (err, res) => {
                        if (err) throw err;
                        console.log(
                            `${answer.rName} was added to the ${answer.roleDept} department.`);
                        viewRoles();
                    });

            });
    });
}

function removeEmployee() {
    const query = `
    SELECT id, concat(employee.first_name, " ", employee.last_name) AS employee_full_name
    FROM employee ;`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        let employees = [];
        let employeesNames = [];
        for (let i = 0; i < res.length; i++) {
            employees.push({
                id: res[i].id,
                fullName: res[i].employee_full_name
            });
            employeesNames.push(res[i].employee_full_name);
        }
        inquirer
            .prompt({
                type: "list",
                name: "employeePromptChoice",
                message: "Select employee to delete:",
                choices: employeesNames
            })
            .then(answer => {
                const chosenEmployee = answer.employeePromptChoice;
                let chosenEmployeeID;
                for (let i = 0; i < employees.length; i++) {
                    if (employees[i].fullName === chosenEmployee) {
                        chosenEmployeeID = employees[i].id;
                        break;
                    }
                }
                const query = "DELETE FROM employee WHERE ?";
                connection.query(query, { id: chosenEmployeeID }, (err, res) => {
                    if (err) throw err;
                    console.log("Employee Removed");
                    setTimeout(viewEmployees, 500);
                });
            });
    });
}
