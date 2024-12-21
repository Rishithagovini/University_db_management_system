--developer(s): Anjana Priya Bachina and Nikhitha Dadi
--last modified: 29-11-2024
-- Drop existing tables if they exist
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS instructors;
DROP TABLE IF EXISTS departments;

-- Create Instructors table first
CREATE TABLE instructors (
    instructor_id SERIAL PRIMARY KEY,
    instructor_name VARCHAR(100) NOT NULL,
    department_id INTEGER
);

-- Create Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    head_id INTEGER REFERENCES instructors(instructor_id)
);

-- Add foreign key to Instructors
ALTER TABLE instructors
ADD CONSTRAINT fk_department
FOREIGN KEY (department_id) REFERENCES departments(department_id);

-- Create Students table
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL
);

-- Create Courses table
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(department_id),
    instructor_id INTEGER NOT NULL REFERENCES instructors(instructor_id)
);

-- Create Enrollments table
CREATE TABLE enrollments (
    student_id INTEGER REFERENCES students(student_id),
    course_id INTEGER REFERENCES courses(course_id),
    PRIMARY KEY (student_id, course_id)
);

-- Insert sample data
-- Insert Instructors first (without department_id initially)
INSERT INTO instructors (instructor_id, instructor_name, department_id) VALUES 
(11, 'John Smith', NULL),
(21, 'Alice Johnson', NULL),
(31, 'Bob Williams', NULL),
(41, 'Carol Brown', NULL),
(51, 'Daniel Davis', NULL),
(61, 'Emma Wilson', NULL),
(71, 'Frank Miller', NULL),
(81, 'Grace Moore', NULL),
(91, 'Harry Taylor', NULL),
(101, 'Ivy Anderson', NULL);

-- Insert Departments
INSERT INTO departments (department_id, department_name, head_id) VALUES 
(1, 'Computer Science', 11),
(2, 'Mathematics', 21),
(3, 'Physics', 31),
(4, 'Biology', 41),
(5, 'Chemistry', 51),
(6, 'English', 61),
(7, 'History', 71),
(8, 'Economics', 81),
(9, 'Psychology', 91),
(10, 'Sociology', 101);

-- Update Instructors with department_id
UPDATE instructors SET department_id = 1 WHERE instructor_id = 11;
UPDATE instructors SET department_id = 2 WHERE instructor_id = 21;
UPDATE instructors SET department_id = 3 WHERE instructor_id = 31;
UPDATE instructors SET department_id = 4 WHERE instructor_id = 41;
UPDATE instructors SET department_id = 5 WHERE instructor_id = 51;
UPDATE instructors SET department_id = 6 WHERE instructor_id = 61;
UPDATE instructors SET department_id = 7 WHERE instructor_id = 71;
UPDATE instructors SET department_id = 8 WHERE instructor_id = 81;
UPDATE instructors SET department_id = 9 WHERE instructor_id = 91;
UPDATE instructors SET department_id = 10 WHERE instructor_id = 101;

-- Insert Courses
INSERT INTO courses (course_id, course_name, department_id, instructor_id) VALUES 
(1, 'Intro to Programming', 1, 11),
(2, 'Calculus I', 2, 21),
(3, 'Physics I', 3, 31),
(4, 'Biology Basics', 4, 41),
(5, 'Organic Chemistry', 5, 51),
(6, 'Literature 101', 6, 61),
(7, 'World History', 7, 71),
(8, 'Microeconomics', 8, 81),
(9, 'Behavioral Psychology', 9, 91),
(10, 'Social Dynamics', 10, 101);

-- Insert Students
INSERT INTO students (student_id, student_name, email, phone_number) VALUES 
(1001, 'James Peterson', 'jamesp@college.edu', '1234567890'),
(1002, 'Sophia White', 'sophiaw@college.edu', '1234567891'),
(1003, 'Ethan Scott', 'ethans@college.edu', '1234567892'),
(1004, 'Olivia Harris', 'oliviah@college.edu', '1234567893'),
(1005, 'Mason Martin', 'masonm@college.edu', '1234567894'),
(1006, 'Isabella Clark', 'isabellac@college.edu', '1234567895'),
(1007, 'Liam Lewis', 'liaml@college.edu', '1234567896'),
(1008, 'Ava Hall', 'avah@college.edu', '1234567897'),
(1009, 'Noah Allen', 'noaha@college.edu', '1234567898'),
(1010, 'Mia Young', 'miay@college.edu', '1234567899');

-- Insert Enrollments
INSERT INTO enrollments (student_id, course_id) VALUES 
(1001, 1),
(1002, 2),
(1003, 3),
(1004, 4),
(1005, 5),
(1006, 6),
(1007, 7),
(1008, 8),
(1009, 9),
(1010, 10);