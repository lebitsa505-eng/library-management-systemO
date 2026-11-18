
CREATE DATABASE IF NOT EXISTS bookwise
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE bookwise;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    membership_id VARCHAR(50) NOT NULL,
    role ENUM('Admin', 'Librarian', 'Member')
        NOT NULL DEFAULT 'Member',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY membership_id (membership_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) DEFAULT NULL,
    isbn VARCHAR(50) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY isbn (isbn)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT NOT NULL AUTO_INCREMENT,
    book_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    member_name VARCHAR(150) NOT NULL,
    transaction_type ENUM('Borrow', 'Return', 'Addition') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    transaction_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Borrowed',
    PRIMARY KEY (id),
    KEY book_id (book_id),
    KEY user_id (user_id),
    CONSTRAINT transactions_ibfk_1
        FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT transactions_ibfk_2
        FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;
