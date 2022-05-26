CREATE TABLE user (
    user_number INT AUTO_INCREMENT,
    user_id varchar(70) NOT NULL UNIQUE,
    user_nickname varchar(20) NOT NULL,
    primary key (user_number)
);