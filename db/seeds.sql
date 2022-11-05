INSERT INTO department (name)
VALUES
    ("Finance"),
    ("Software"),
    ("Sales");
    
INSERT INTO role (title, salary, department_id)
VALUES 
    ("Finance Manager", 100000, 1),
    ("Softwar Manager", 150000, 2),
    ("Sales Manager", 125000, 3),
    ("Accountant", 75000, 1),
    ("Software Enginner", 95000, 2),
    ("Salesman", 85000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("James", "Smith", 1, NULL),
    ("Robert", "Williams", 2, NULL),
    ("John", "Brown", 3, NULL),
    ("Mary", "Jones", 4, 1),
    ("Mark", "Moore", 5, 2),
    ("Jennifer", "Martin", 6, 3);