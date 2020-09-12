USE employeesDB;

INSERT INTO department (id, name)
VALUES 
(1,'Management'),
(2,'HR'),
(3,'Sales'),
(4,'GeekSquad (Repairs)'),
(5,'Warehouse');

INSERT INTO role (id, title, salary, department_id)
VALUES 
(1,'Store Manager',130000,1),
(2,'Assistant Manager',70000,1),
(3,'Sales Manager',50000,1),
(4,'Warehouse Manager',40000,1),
(5,'HR Director',40000,2),
(6,'Computer Sales',20000,3),
(7,'TV Sales',20000,3),
(8,'Phone Sales',20000,3),
(9,'Cashier',15000,3),
(10,'Geeksquad Director',40000,4),
(11,'Geeksquad Engineer',20000,4),
(12,'Lift Operator',25000,5),
(13,'Warehouse Worker',20000,5);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES 
(1,'Steve','Watkins',1,1),
(2,'Alex','Psy',2,1),
(3,'Tyler','Walden',3,2),
(4,'Shawn','Araujo',4,2),
(5,'Hailey','Johnson',5,2),
(6,'Reed','Santos',6,3),
(7,'Darren','Saltzman',6,3),
(8,'Jake','Lahue',7,3),
(9,'Michael','Bouche',7,3),
(10,'Tom','Hartley',8,3),
(11,'Zach','Landry',9,2),
(12,'Stephanie','LaBuah',9,2),
(13,'Jack','Taft',10,2),
(14,'James','Friendly',11,13),
(15,'Ethan','Boise',12,4),
(16,'Matt','Ox',13,4);

