-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 05, 2026 at 10:09 PM
-- Server version: 11.8.6-MariaDB-ubu2404
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `app_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `athletes`
--

CREATE TABLE `athletes` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `birth_date` date NOT NULL,
  `birth_place` varchar(150) NOT NULL,
  `birth_country_id` int(11) NOT NULL,
  `death_date` date NOT NULL,
  `death_place` varchar(150) NOT NULL,
  `death_country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `athlete_medals`
--

CREATE TABLE `athlete_medals` (
  `id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `olympic_games_id` int(11) NOT NULL,
  `discipline_id` int(11) NOT NULL,
  `medal_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `disciplines`
--

CREATE TABLE `disciplines` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `auth_type` enum('local','google') NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medal_types`
--

CREATE TABLE `medal_types` (
  `id` int(11) NOT NULL,
  `placing` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `olympic_games`
--

CREATE TABLE `olympic_games` (
  `id` int(11) NOT NULL,
  `year` varchar(4) NOT NULL,
  `city` varchar(100) NOT NULL,
  `type` enum('LOH','ZOH') NOT NULL,
  `country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(64) NOT NULL,
  `last_name` varchar(64) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `auth_type` enum('local','google') NOT NULL DEFAULT 'local',
  `google_id` varchar(255) DEFAULT NULL,
  `tfa_secret` VARCHAR(255) DEFAULT NULL,   
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `athletes`
--
ALTER TABLE `athletes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `athletes_birth_conutries_constr` (`birth_country_id`),
  ADD KEY `athletes_death_conutries_constr` (`death_country_id`);

--
-- Indexes for table `athlete_medals`
--
ALTER TABLE `athlete_medals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`,`athlete_id`),
  ADD UNIQUE KEY `id_2` (`id`,`olympic_games_id`),
  ADD UNIQUE KEY `id_3` (`id`,`discipline_id`),
  ADD KEY `athlete_medals_disciplines_constr` (`discipline_id`),
  ADD KEY `athlete_medals_medal_types_constr` (`medal_type_id`),
  ADD KEY `athlete_medals_olympic_games_constr` (`olympic_games_id`),
  ADD KEY `athlete_medals_athletes_constr` (`athlete_id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `disciplines`
--
ALTER TABLE `disciplines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `medal_types`
--
ALTER TABLE `medal_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `placing` (`placing`);

--
-- Indexes for table `olympic_games`
--
ALTER TABLE `olympic_games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year` (`year`,`type`),
  ADD KEY `games_country_constr` (`country_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `athlete_medals`
--
ALTER TABLE `athlete_medals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `disciplines`
--
ALTER TABLE `disciplines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medal_types`
--
ALTER TABLE `medal_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `olympic_games`
--
ALTER TABLE `olympic_games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `athletes`
--
ALTER TABLE `athletes`
  ADD CONSTRAINT `athletes_birth_conutries_constr` FOREIGN KEY (`birth_country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `athletes_death_conutries_constr` FOREIGN KEY (`death_country_id`) REFERENCES `countries` (`id`);

--
-- Constraints for table `athlete_medals`
--
ALTER TABLE `athlete_medals`
  ADD CONSTRAINT `athlete_medals_athletes_constr` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`),
  ADD CONSTRAINT `athlete_medals_disciplines_constr` FOREIGN KEY (`discipline_id`) REFERENCES `disciplines` (`id`),
  ADD CONSTRAINT `athlete_medals_medal_types_constr` FOREIGN KEY (`medal_type_id`) REFERENCES `medal_types` (`id`),
  ADD CONSTRAINT `athlete_medals_olympic_games_constr` FOREIGN KEY (`olympic_games_id`) REFERENCES `olympic_games` (`id`);

--
-- Constraints for table `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `olympic_games`
--
ALTER TABLE `olympic_games`
  ADD CONSTRAINT `games_country_constr` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
