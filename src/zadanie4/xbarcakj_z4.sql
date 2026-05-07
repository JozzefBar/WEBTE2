-- phpMyAdmin SQL Dump
-- version 5.2.2deb1+noble1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 07, 2026 at 06:35 PM
-- Server version: 10.11.14-MariaDB-0ubuntu0.24.04.1
-- PHP Version: 8.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `xbarcakj_z4`
--

-- --------------------------------------------------------

--
-- Table structure for table `destinations`
--

CREATE TABLE `destinations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `country_code` char(2) NOT NULL,
  `capital` varchar(255) NOT NULL,
  `currency_code` char(3) NOT NULL,
  `currency_name` varchar(255) NOT NULL,
  `latitude` decimal(8,5) NOT NULL,
  `longitude` decimal(8,5) NOT NULL,
  `flight_hours_from_vienna` decimal(3,1) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destinations`
--

INSERT INTO `destinations` (`id`, `name`, `country`, `country_code`, `capital`, `currency_code`, `currency_name`, `latitude`, `longitude`, `flight_hours_from_vienna`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Barcelona', 'Španielsko', 'es', 'Madrid', 'EUR', 'Euro', 41.38510, 2.17340, 2.5, 'Pulzujúce katalánske mesto s plážami, Gaudího architektúrou a bohatým nočným životom.', '2026-05-06 14:30:25', '2026-05-06 14:30:25'),
(2, 'Dubrovník', 'Chorvátsko', 'hr', 'Záhreb', 'EUR', 'Euro', 42.65070, 18.09440, 1.5, 'Perla Jadránu s historickými hradbami a krištáľovo čistým morom.', '2026-05-06 14:30:25', '2026-05-06 14:30:25'),
(3, 'Reykjavík', 'Island', 'is', 'Reykjavík', 'ISK', 'Islandská koruna', 64.14660, -21.94260, 4.5, 'Brána k ľadovcom, gejzírom a polárnej žiare.', '2026-05-06 14:30:25', '2026-05-06 14:30:25'),
(4, 'Marrákeš', 'Maroko', 'ma', 'Rabat', 'MAD', 'Marocký dirham', 31.62950, -7.98110, 4.0, 'Exotické trhy, paláce a brána do Sahary.', '2026-05-06 14:30:25', '2026-05-06 14:30:25'),
(5, 'Santorini', 'Grécko', 'gr', 'Atény', 'EUR', 'Euro', 36.39320, 25.46150, 2.5, 'Ikonický grécky ostrov s bielymi domčekmi a úchvatnými západmi slnka.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(6, 'Praha', 'Česko', 'cz', 'Praha', 'CZK', 'Česká koruna', 50.07550, 14.43780, 1.0, 'Stovežaté mesto s bohatou históriou, gotickou architektúrou a skvelým pivom.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(7, 'Istanbul', 'Turecko', 'tr', 'Ankara', 'TRY', 'Turecká líra', 41.00820, 28.97840, 2.5, 'Mesto na dvoch kontinentoch s mešitami, bazármi a úžasnou kuchyňou.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(8, 'Rím', 'Taliansko', 'it', 'Rím', 'EUR', 'Euro', 41.90280, 12.49640, 1.5, 'Večné mesto plné antických pamiatok, umenia a vynikajúcej gastronómie.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(9, 'Lisabon', 'Portugalsko', 'pt', 'Lisabon', 'EUR', 'Euro', 38.72230, -9.13930, 3.0, 'Mesto siedmich pahorkov s historickými električkami a pastéis de nata.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(10, 'Chamonix', 'Francúzsko', 'fr', 'Paríž', 'EUR', 'Euro', 45.92370, 6.86940, 1.5, 'Alpské stredisko pod Mont Blancom — raj pre lyžiarov aj horolezcov.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(11, 'Amsterdam', 'Holandsko', 'nl', 'Amsterdam', 'EUR', 'Euro', 52.36760, 4.90410, 2.0, 'Mesto kanálov, múzeí Van Gogha a Rembrandta, a tulipánov.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(12, 'Dubaj', 'SAE', 'ae', 'Abú Dhabí', 'AED', 'Emirátsky dirham', 25.20480, 55.27080, 5.5, 'Futuristické mesto v púšti s luxusom, mrakodrapmi a umelými ostrovmi.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(13, 'Viedeň', 'Rakúsko', 'at', 'Viedeň', 'EUR', 'Euro', 48.20820, 16.37380, 0.5, 'Cisárske mesto s operou, kaviarňami a Schönbrunnom.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(14, 'Split', 'Chorvátsko', 'hr', 'Záhreb', 'EUR', 'Euro', 43.50810, 16.44020, 1.5, 'Diokleciánov palác pri mori — mix histórie a pláží.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(15, 'Budapešť', 'Maďarsko', 'hu', 'Budapešť', 'HUF', 'Maďarský forint', 47.49790, 19.04020, 0.8, 'Mesto termálnych kúpeľov, parlamentu na Dunaji a ruín barov.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(16, 'Nice', 'Francúzsko', 'fr', 'Paríž', 'EUR', 'Euro', 43.71020, 7.26200, 1.5, 'Srdce Francúzskej riviéry s promenádou, plážami a azúrovým morom.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(17, 'Londýn', 'Veľká Británia', 'gb', 'Londýn', 'GBP', 'Britská libra', 51.50740, -0.12780, 2.5, 'Svetová metropola s kráľovskými palácmi, múzeami a divadlami.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(18, 'Innsbruck', 'Rakúsko', 'at', 'Viedeň', 'EUR', 'Euro', 47.26920, 11.40410, 0.8, 'Alpské mesto obklopené horami — ideálne na lyžovanie aj turistiku.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(19, 'Kréta', 'Grécko', 'gr', 'Atény', 'EUR', 'Euro', 35.24010, 24.80930, 2.5, 'Najväčší grécky ostrov s plážami, súťažami a minojskou históriou.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(20, 'Salzburg', 'Rakúsko', 'at', 'Viedeň', 'EUR', 'Euro', 47.80950, 13.05500, 0.5, 'Mozartovo mesto v srdci Álp — hudba, príroda a histórie.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(21, 'Mallorca', 'Španielsko', 'es', 'Madrid', 'EUR', 'Euro', 39.69530, 3.01760, 2.0, 'Baleársky ostrov s tyrkysovými zátokami a horskými dedinkami.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(22, 'Paríž', 'Francúzsko', 'fr', 'Paríž', 'EUR', 'Euro', 48.85660, 2.35220, 2.0, 'Mesto svetla, Eiffelovky, Louvru a romantiky.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(23, 'Zakynthos', 'Grécko', 'gr', 'Atény', 'EUR', 'Euro', 37.78700, 20.89790, 2.0, 'Ostrov s legendárnou Navagio plážou a korytnačkami.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(24, 'Edinburg', 'Veľká Británia', 'gb', 'Londýn', 'GBP', 'Britská libra', 55.95330, -3.18830, 3.0, 'Škótske hlavné mesto s hradom, whisky a Highlands na dosah.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(25, 'Antalya', 'Turecko', 'tr', 'Ankara', 'TRY', 'Turecká líra', 36.89690, 30.71330, 2.5, 'Turecká riviéra s antickými ruinami a tyrkysovým morom.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(26, 'Zermatt', 'Švajčiarsko', 'ch', 'Bern', 'CHF', 'Švajčiarsky frank', 46.02070, 7.74910, 1.5, 'Luxusné alpské stredisko pod Matterhornom.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(27, 'Kodaň', 'Dánsko', 'dk', 'Kodaň', 'DKK', 'Dánska koruna', 55.67610, 12.56830, 2.0, 'Hygge mesto s Nyhavnom, dizajnom a najlepšími reštauráciami.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(28, 'Kappadócia', 'Turecko', 'tr', 'Ankara', 'TRY', 'Turecká líra', 38.64310, 34.82890, 3.0, 'Rozprávková krajina skalných miest a balonových letov.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(29, 'Tenerife', 'Španielsko', 'es', 'Madrid', 'EUR', 'Euro', 28.29160, -16.62910, 4.5, 'Kanársky ostrov s večným jarom, sopkou Teide a čiernymi plážami.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(30, 'Krakov', 'Poľsko', 'pl', 'Varšava', 'PLN', 'Poľský zlotý', 50.06470, 19.94500, 1.0, 'Kráľovské mesto s Wawelom, soľnými baňami a živým námestím.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(31, 'Malta', 'Malta', 'mt', 'Valletta', 'EUR', 'Euro', 35.89890, 14.51460, 2.0, 'Ostrovný štát s rytierskou históriou, azúrovým morom a slnkom.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(32, 'Tromsø', 'Nórsko', 'no', 'Oslo', 'NOK', 'Nórska koruna', 69.64960, 18.95600, 3.5, 'Brána do Arktídy — polárna žiara a polnočné slnko.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(33, 'Tbilisi', 'Gruzínsko', 'ge', 'Tbilisi', 'GEL', 'Gruzínsky lari', 41.71510, 44.82710, 3.5, 'Starobylé mesto s unikátnou kuchyňou, vínom a horami Kaukazu.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(34, 'Funchal', 'Portugalsko', 'pt', 'Lisabon', 'EUR', 'Euro', 32.66690, -16.92410, 4.0, 'Madeira — ostrov večnej jari s exotickými záhradami a levádami.', '2026-05-06 14:30:26', '2026-05-06 14:30:26'),
(35, 'Bangkok', 'Thajsko', 'th', 'Bangkok', 'THB', 'Thajský baht', 13.75630, 100.50180, 10.0, 'Živé ázijské mesto s chrámami, pouličným jedlom a nočnými trhmi.', '2026-05-06 14:30:26', '2026-05-06 14:30:26');

-- --------------------------------------------------------

--
-- Table structure for table `destination_types`
--

CREATE TABLE `destination_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `destination_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('beach','mountains','historical','city','adventure') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destination_types`
--

INSERT INTO `destination_types` (`id`, `destination_id`, `type`) VALUES
(1, 1, 'beach'),
(2, 1, 'historical'),
(3, 1, 'city'),
(4, 2, 'beach'),
(5, 2, 'historical'),
(7, 3, 'mountains'),
(6, 3, 'adventure'),
(8, 4, 'historical'),
(9, 4, 'adventure'),
(10, 5, 'beach'),
(11, 5, 'city'),
(12, 6, 'historical'),
(13, 6, 'city'),
(14, 7, 'historical'),
(15, 7, 'city'),
(16, 7, 'adventure'),
(17, 8, 'historical'),
(18, 8, 'city'),
(21, 9, 'beach'),
(19, 9, 'historical'),
(20, 9, 'city'),
(22, 10, 'mountains'),
(23, 10, 'adventure'),
(25, 11, 'historical'),
(24, 11, 'city'),
(26, 12, 'beach'),
(27, 12, 'city'),
(28, 12, 'adventure'),
(29, 13, 'historical'),
(30, 13, 'city'),
(31, 14, 'beach'),
(32, 14, 'historical'),
(33, 14, 'city'),
(34, 15, 'historical'),
(35, 15, 'city'),
(36, 16, 'beach'),
(37, 16, 'city'),
(39, 17, 'historical'),
(38, 17, 'city'),
(40, 18, 'mountains'),
(41, 18, 'adventure'),
(42, 19, 'beach'),
(43, 19, 'historical'),
(44, 19, 'adventure'),
(46, 20, 'mountains'),
(45, 20, 'historical'),
(47, 21, 'beach'),
(48, 21, 'mountains'),
(49, 21, 'adventure'),
(51, 22, 'historical'),
(50, 22, 'city'),
(52, 23, 'beach'),
(53, 23, 'adventure'),
(56, 24, 'mountains'),
(54, 24, 'historical'),
(55, 24, 'city'),
(57, 25, 'beach'),
(58, 25, 'historical'),
(59, 26, 'mountains'),
(60, 26, 'adventure'),
(62, 27, 'historical'),
(61, 27, 'city'),
(64, 28, 'historical'),
(63, 28, 'adventure'),
(65, 29, 'beach'),
(66, 29, 'mountains'),
(67, 29, 'adventure'),
(68, 30, 'historical'),
(69, 30, 'city'),
(70, 31, 'beach'),
(71, 31, 'historical'),
(72, 31, 'city'),
(74, 32, 'mountains'),
(73, 32, 'adventure'),
(75, 33, 'historical'),
(77, 33, 'city'),
(76, 33, 'adventure'),
(80, 34, 'beach'),
(78, 34, 'mountains'),
(79, 34, 'adventure'),
(81, 35, 'city'),
(82, 35, 'adventure');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2024_01_01_000001_create_destinations_table', 1),
(2, '2024_01_01_000002_create_destination_types_table', 1),
(3, '2024_01_01_000003_create_monthly_weather_table', 1),
(4, '2024_01_01_000004_create_visits_table', 1),
(5, '2024_01_01_000005_create_searches_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `monthly_weather`
--

CREATE TABLE `monthly_weather` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `destination_id` bigint(20) UNSIGNED NOT NULL,
  `month` tinyint(4) NOT NULL,
  `avg_temp` decimal(4,1) NOT NULL,
  `avg_min_temp` decimal(4,1) NOT NULL,
  `avg_max_temp` decimal(4,1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `monthly_weather`
--

INSERT INTO `monthly_weather` (`id`, `destination_id`, `month`, `avg_temp`, `avg_min_temp`, `avg_max_temp`) VALUES
(1, 1, 1, 9.0, 5.0, 13.0),
(2, 1, 2, 10.0, 6.0, 14.0),
(3, 1, 3, 12.0, 8.0, 16.0),
(4, 1, 4, 15.0, 10.0, 18.0),
(5, 1, 5, 18.0, 14.0, 22.0),
(6, 1, 6, 22.0, 18.0, 26.0),
(7, 1, 7, 25.0, 21.0, 29.0),
(8, 1, 8, 25.0, 21.0, 29.0),
(9, 1, 9, 22.0, 18.0, 26.0),
(10, 1, 10, 18.0, 14.0, 22.0),
(11, 1, 11, 13.0, 9.0, 17.0),
(12, 1, 12, 10.0, 6.0, 14.0),
(13, 2, 1, 9.0, 5.0, 12.0),
(14, 2, 2, 10.0, 6.0, 13.0),
(15, 2, 3, 12.0, 8.0, 15.0),
(16, 2, 4, 14.0, 10.0, 18.0),
(17, 2, 5, 19.0, 14.0, 22.0),
(18, 2, 6, 23.0, 18.0, 27.0),
(19, 2, 7, 26.0, 21.0, 30.0),
(20, 2, 8, 26.0, 21.0, 30.0),
(21, 2, 9, 22.0, 18.0, 27.0),
(22, 2, 10, 18.0, 14.0, 22.0),
(23, 2, 11, 13.0, 9.0, 17.0),
(24, 2, 12, 10.0, 6.0, 13.0),
(25, 3, 1, -1.0, -4.0, 2.0),
(26, 3, 2, 0.0, -3.0, 3.0),
(27, 3, 3, 1.0, -2.0, 4.0),
(28, 3, 4, 3.0, 0.0, 7.0),
(29, 3, 5, 7.0, 3.0, 10.0),
(30, 3, 6, 11.0, 7.0, 14.0),
(31, 3, 7, 13.0, 9.0, 15.0),
(32, 3, 8, 12.0, 8.0, 14.0),
(33, 3, 9, 9.0, 5.0, 11.0),
(34, 3, 10, 5.0, 2.0, 7.0),
(35, 3, 11, 1.0, -2.0, 3.0),
(36, 3, 12, -1.0, -4.0, 1.0),
(37, 4, 1, 12.0, 6.0, 18.0),
(38, 4, 2, 14.0, 8.0, 20.0),
(39, 4, 3, 16.0, 10.0, 23.0),
(40, 4, 4, 18.0, 12.0, 25.0),
(41, 4, 5, 22.0, 15.0, 29.0),
(42, 4, 6, 26.0, 18.0, 34.0),
(43, 4, 7, 30.0, 21.0, 38.0),
(44, 4, 8, 30.0, 21.0, 38.0),
(45, 4, 9, 26.0, 18.0, 33.0),
(46, 4, 10, 22.0, 14.0, 28.0),
(47, 4, 11, 16.0, 10.0, 23.0),
(48, 4, 12, 13.0, 7.0, 19.0),
(49, 5, 1, 10.0, 7.0, 14.0),
(50, 5, 2, 10.0, 7.0, 14.0),
(51, 5, 3, 12.0, 8.0, 16.0),
(52, 5, 4, 15.0, 11.0, 19.0),
(53, 5, 5, 19.0, 15.0, 23.0),
(54, 5, 6, 24.0, 19.0, 28.0),
(55, 5, 7, 26.0, 22.0, 30.0),
(56, 5, 8, 26.0, 22.0, 30.0),
(57, 5, 9, 23.0, 19.0, 27.0),
(58, 5, 10, 19.0, 16.0, 23.0),
(59, 5, 11, 15.0, 12.0, 19.0),
(60, 5, 12, 12.0, 9.0, 15.0),
(61, 6, 1, -1.0, -4.0, 2.0),
(62, 6, 2, 1.0, -3.0, 4.0),
(63, 6, 3, 5.0, 0.0, 9.0),
(64, 6, 4, 9.0, 3.0, 15.0),
(65, 6, 5, 14.0, 8.0, 20.0),
(66, 6, 6, 17.0, 11.0, 23.0),
(67, 6, 7, 19.0, 13.0, 25.0),
(68, 6, 8, 19.0, 13.0, 25.0),
(69, 6, 9, 14.0, 9.0, 20.0),
(70, 6, 10, 9.0, 5.0, 14.0),
(71, 6, 11, 4.0, 1.0, 7.0),
(72, 6, 12, 0.0, -3.0, 3.0),
(73, 7, 1, 6.0, 3.0, 9.0),
(74, 7, 2, 6.0, 3.0, 10.0),
(75, 7, 3, 8.0, 4.0, 12.0),
(76, 7, 4, 13.0, 8.0, 17.0),
(77, 7, 5, 17.0, 13.0, 22.0),
(78, 7, 6, 22.0, 17.0, 27.0),
(79, 7, 7, 25.0, 20.0, 29.0),
(80, 7, 8, 25.0, 21.0, 29.0),
(81, 7, 9, 21.0, 17.0, 25.0),
(82, 7, 10, 16.0, 13.0, 20.0),
(83, 7, 11, 11.0, 8.0, 15.0),
(84, 7, 12, 8.0, 5.0, 11.0),
(85, 8, 1, 8.0, 3.0, 12.0),
(86, 8, 2, 9.0, 4.0, 13.0),
(87, 8, 3, 12.0, 6.0, 16.0),
(88, 8, 4, 14.0, 9.0, 19.0),
(89, 8, 5, 19.0, 13.0, 24.0),
(90, 8, 6, 23.0, 16.0, 28.0),
(91, 8, 7, 26.0, 19.0, 31.0),
(92, 8, 8, 26.0, 19.0, 31.0),
(93, 8, 9, 22.0, 16.0, 28.0),
(94, 8, 10, 18.0, 12.0, 22.0),
(95, 8, 11, 13.0, 8.0, 17.0),
(96, 8, 12, 9.0, 4.0, 13.0),
(97, 9, 1, 12.0, 8.0, 15.0),
(98, 9, 2, 13.0, 9.0, 16.0),
(99, 9, 3, 15.0, 11.0, 18.0),
(100, 9, 4, 16.0, 12.0, 20.0),
(101, 9, 5, 18.0, 14.0, 22.0),
(102, 9, 6, 21.0, 17.0, 25.0),
(103, 9, 7, 24.0, 19.0, 28.0),
(104, 9, 8, 24.0, 19.0, 28.0),
(105, 9, 9, 22.0, 18.0, 26.0),
(106, 9, 10, 19.0, 15.0, 22.0),
(107, 9, 11, 15.0, 11.0, 18.0),
(108, 9, 12, 12.0, 9.0, 15.0),
(109, 10, 1, -2.0, -6.0, 3.0),
(110, 10, 2, 0.0, -5.0, 5.0),
(111, 10, 3, 4.0, -1.0, 9.0),
(112, 10, 4, 7.0, 2.0, 13.0),
(113, 10, 5, 12.0, 6.0, 17.0),
(114, 10, 6, 15.0, 9.0, 21.0),
(115, 10, 7, 18.0, 11.0, 24.0),
(116, 10, 8, 17.0, 11.0, 23.0),
(117, 10, 9, 13.0, 8.0, 19.0),
(118, 10, 10, 9.0, 4.0, 13.0),
(119, 10, 11, 3.0, -1.0, 7.0),
(120, 10, 12, -1.0, -5.0, 3.0),
(121, 11, 1, 4.0, 1.0, 6.0),
(122, 11, 2, 4.0, 1.0, 7.0),
(123, 11, 3, 7.0, 3.0, 10.0),
(124, 11, 4, 10.0, 5.0, 14.0),
(125, 11, 5, 14.0, 9.0, 18.0),
(126, 11, 6, 17.0, 12.0, 20.0),
(127, 11, 7, 19.0, 14.0, 22.0),
(128, 11, 8, 19.0, 14.0, 22.0),
(129, 11, 9, 16.0, 11.0, 19.0),
(130, 11, 10, 12.0, 8.0, 15.0),
(131, 11, 11, 7.0, 4.0, 10.0),
(132, 11, 12, 5.0, 2.0, 7.0),
(133, 12, 1, 19.0, 14.0, 24.0),
(134, 12, 2, 20.0, 15.0, 25.0),
(135, 12, 3, 23.0, 18.0, 28.0),
(136, 12, 4, 27.0, 21.0, 33.0),
(137, 12, 5, 31.0, 25.0, 37.0),
(138, 12, 6, 34.0, 28.0, 39.0),
(139, 12, 7, 36.0, 30.0, 42.0),
(140, 12, 8, 36.0, 31.0, 42.0),
(141, 12, 9, 33.0, 28.0, 39.0),
(142, 12, 10, 29.0, 24.0, 35.0),
(143, 12, 11, 25.0, 20.0, 30.0),
(144, 12, 12, 21.0, 16.0, 26.0),
(145, 13, 1, 1.0, -3.0, 4.0),
(146, 13, 2, 3.0, -1.0, 6.0),
(147, 13, 3, 7.0, 2.0, 11.0),
(148, 13, 4, 12.0, 6.0, 17.0),
(149, 13, 5, 17.0, 10.0, 22.0),
(150, 13, 6, 20.0, 14.0, 25.0),
(151, 13, 7, 22.0, 16.0, 28.0),
(152, 13, 8, 22.0, 16.0, 27.0),
(153, 13, 9, 17.0, 12.0, 22.0),
(154, 13, 10, 12.0, 7.0, 16.0),
(155, 13, 11, 6.0, 2.0, 9.0),
(156, 13, 12, 2.0, -1.0, 5.0),
(157, 14, 1, 8.0, 4.0, 12.0),
(158, 14, 2, 9.0, 5.0, 13.0),
(159, 14, 3, 11.0, 7.0, 16.0),
(160, 14, 4, 14.0, 10.0, 19.0),
(161, 14, 5, 19.0, 14.0, 24.0),
(162, 14, 6, 23.0, 18.0, 28.0),
(163, 14, 7, 26.0, 21.0, 31.0),
(164, 14, 8, 26.0, 21.0, 31.0),
(165, 14, 9, 22.0, 17.0, 27.0),
(166, 14, 10, 17.0, 13.0, 22.0),
(167, 14, 11, 12.0, 8.0, 16.0),
(168, 14, 12, 9.0, 5.0, 13.0),
(169, 15, 1, 0.0, -3.0, 3.0),
(170, 15, 2, 2.0, -1.0, 5.0),
(171, 15, 3, 7.0, 2.0, 11.0),
(172, 15, 4, 12.0, 6.0, 17.0),
(173, 15, 5, 17.0, 11.0, 22.0),
(174, 15, 6, 20.0, 14.0, 26.0),
(175, 15, 7, 22.0, 16.0, 28.0),
(176, 15, 8, 22.0, 16.0, 28.0),
(177, 15, 9, 17.0, 12.0, 22.0),
(178, 15, 10, 11.0, 7.0, 16.0),
(179, 15, 11, 5.0, 2.0, 8.0),
(180, 15, 12, 1.0, -2.0, 4.0),
(181, 16, 1, 8.0, 4.0, 12.0),
(182, 16, 2, 9.0, 5.0, 13.0),
(183, 16, 3, 11.0, 7.0, 16.0),
(184, 16, 4, 14.0, 10.0, 18.0),
(185, 16, 5, 17.0, 14.0, 22.0),
(186, 16, 6, 21.0, 17.0, 25.0),
(187, 16, 7, 24.0, 20.0, 28.0),
(188, 16, 8, 24.0, 20.0, 28.0),
(189, 16, 9, 21.0, 17.0, 25.0),
(190, 16, 10, 17.0, 13.0, 21.0),
(191, 16, 11, 12.0, 8.0, 16.0),
(192, 16, 12, 9.0, 5.0, 13.0),
(193, 17, 1, 5.0, 2.0, 8.0),
(194, 17, 2, 5.0, 2.0, 9.0),
(195, 17, 3, 8.0, 3.0, 12.0),
(196, 17, 4, 10.0, 5.0, 15.0),
(197, 17, 5, 14.0, 8.0, 18.0),
(198, 17, 6, 17.0, 11.0, 21.0),
(199, 17, 7, 19.0, 14.0, 24.0),
(200, 17, 8, 19.0, 13.0, 23.0),
(201, 17, 9, 16.0, 11.0, 20.0),
(202, 17, 10, 12.0, 8.0, 15.0),
(203, 17, 11, 8.0, 5.0, 11.0),
(204, 17, 12, 5.0, 3.0, 8.0),
(205, 18, 1, -1.0, -5.0, 3.0),
(206, 18, 2, 1.0, -4.0, 5.0),
(207, 18, 3, 6.0, 0.0, 11.0),
(208, 18, 4, 10.0, 3.0, 15.0),
(209, 18, 5, 15.0, 8.0, 20.0),
(210, 18, 6, 18.0, 11.0, 23.0),
(211, 18, 7, 20.0, 13.0, 25.0),
(212, 18, 8, 19.0, 12.0, 24.0),
(213, 18, 9, 15.0, 9.0, 20.0),
(214, 18, 10, 10.0, 5.0, 15.0),
(215, 18, 11, 4.0, 0.0, 8.0),
(216, 18, 12, 0.0, -4.0, 4.0),
(217, 19, 1, 12.0, 8.0, 16.0),
(218, 19, 2, 12.0, 8.0, 16.0),
(219, 19, 3, 14.0, 10.0, 18.0),
(220, 19, 4, 17.0, 12.0, 21.0),
(221, 19, 5, 21.0, 16.0, 25.0),
(222, 19, 6, 25.0, 20.0, 29.0),
(223, 19, 7, 28.0, 23.0, 32.0),
(224, 19, 8, 28.0, 23.0, 32.0),
(225, 19, 9, 24.0, 20.0, 28.0),
(226, 19, 10, 20.0, 16.0, 24.0),
(227, 19, 11, 16.0, 12.0, 20.0),
(228, 19, 12, 13.0, 9.0, 17.0),
(229, 20, 1, -1.0, -5.0, 3.0),
(230, 20, 2, 1.0, -4.0, 5.0),
(231, 20, 3, 5.0, 0.0, 10.0),
(232, 20, 4, 10.0, 3.0, 15.0),
(233, 20, 5, 15.0, 7.0, 20.0),
(234, 20, 6, 18.0, 11.0, 23.0),
(235, 20, 7, 20.0, 13.0, 25.0),
(236, 20, 8, 19.0, 12.0, 24.0),
(237, 20, 9, 15.0, 9.0, 20.0),
(238, 20, 10, 10.0, 5.0, 14.0),
(239, 20, 11, 4.0, 0.0, 7.0),
(240, 20, 12, 0.0, -4.0, 3.0),
(241, 21, 1, 10.0, 6.0, 15.0),
(242, 21, 2, 11.0, 6.0, 15.0),
(243, 21, 3, 13.0, 8.0, 17.0),
(244, 21, 4, 15.0, 10.0, 19.0),
(245, 21, 5, 19.0, 14.0, 23.0),
(246, 21, 6, 23.0, 18.0, 28.0),
(247, 21, 7, 26.0, 21.0, 31.0),
(248, 21, 8, 27.0, 22.0, 31.0),
(249, 21, 9, 23.0, 19.0, 28.0),
(250, 21, 10, 19.0, 15.0, 23.0),
(251, 21, 11, 14.0, 10.0, 18.0),
(252, 21, 12, 11.0, 7.0, 15.0),
(253, 22, 1, 5.0, 2.0, 7.0),
(254, 22, 2, 6.0, 2.0, 9.0),
(255, 22, 3, 9.0, 5.0, 13.0),
(256, 22, 4, 12.0, 7.0, 16.0),
(257, 22, 5, 16.0, 10.0, 20.0),
(258, 22, 6, 19.0, 14.0, 23.0),
(259, 22, 7, 22.0, 16.0, 26.0),
(260, 22, 8, 21.0, 16.0, 25.0),
(261, 22, 9, 18.0, 13.0, 22.0),
(262, 22, 10, 13.0, 9.0, 16.0),
(263, 22, 11, 8.0, 5.0, 10.0),
(264, 22, 12, 5.0, 3.0, 7.0),
(265, 23, 1, 10.0, 6.0, 14.0),
(266, 23, 2, 11.0, 7.0, 15.0),
(267, 23, 3, 13.0, 8.0, 17.0),
(268, 23, 4, 16.0, 11.0, 20.0),
(269, 23, 5, 20.0, 15.0, 25.0),
(270, 23, 6, 25.0, 19.0, 30.0),
(271, 23, 7, 27.0, 21.0, 33.0),
(272, 23, 8, 27.0, 21.0, 33.0),
(273, 23, 9, 24.0, 18.0, 29.0),
(274, 23, 10, 19.0, 15.0, 24.0),
(275, 23, 11, 15.0, 11.0, 19.0),
(276, 23, 12, 12.0, 8.0, 16.0),
(277, 24, 1, 4.0, 1.0, 7.0),
(278, 24, 2, 5.0, 1.0, 8.0),
(279, 24, 3, 6.0, 2.0, 9.0),
(280, 24, 4, 8.0, 4.0, 12.0),
(281, 24, 5, 11.0, 6.0, 15.0),
(282, 24, 6, 14.0, 9.0, 17.0),
(283, 24, 7, 15.0, 11.0, 19.0),
(284, 24, 8, 15.0, 11.0, 19.0),
(285, 24, 9, 13.0, 9.0, 16.0),
(286, 24, 10, 9.0, 6.0, 12.0),
(287, 24, 11, 6.0, 3.0, 9.0),
(288, 24, 12, 4.0, 1.0, 7.0),
(289, 25, 1, 10.0, 5.0, 15.0),
(290, 25, 2, 11.0, 6.0, 16.0),
(291, 25, 3, 13.0, 7.0, 18.0),
(292, 25, 4, 16.0, 10.0, 22.0),
(293, 25, 5, 21.0, 15.0, 27.0),
(294, 25, 6, 26.0, 19.0, 32.0),
(295, 25, 7, 29.0, 23.0, 35.0),
(296, 25, 8, 29.0, 23.0, 35.0),
(297, 25, 9, 25.0, 19.0, 31.0),
(298, 25, 10, 20.0, 14.0, 26.0),
(299, 25, 11, 15.0, 10.0, 20.0),
(300, 25, 12, 11.0, 7.0, 16.0),
(301, 26, 1, -5.0, -10.0, -1.0),
(302, 26, 2, -4.0, -9.0, 0.0),
(303, 26, 3, 0.0, -5.0, 4.0),
(304, 26, 4, 3.0, -2.0, 8.0),
(305, 26, 5, 8.0, 3.0, 13.0),
(306, 26, 6, 12.0, 6.0, 17.0),
(307, 26, 7, 14.0, 8.0, 20.0),
(308, 26, 8, 14.0, 8.0, 19.0),
(309, 26, 9, 10.0, 5.0, 15.0),
(310, 26, 10, 5.0, 1.0, 10.0),
(311, 26, 11, 0.0, -4.0, 4.0),
(312, 26, 12, -4.0, -8.0, 0.0),
(313, 27, 1, 1.0, -2.0, 3.0),
(314, 27, 2, 1.0, -2.0, 4.0),
(315, 27, 3, 3.0, 0.0, 6.0),
(316, 27, 4, 8.0, 3.0, 12.0),
(317, 27, 5, 13.0, 8.0, 17.0),
(318, 27, 6, 16.0, 11.0, 20.0),
(319, 27, 7, 18.0, 14.0, 22.0),
(320, 27, 8, 18.0, 13.0, 22.0),
(321, 27, 9, 14.0, 10.0, 18.0),
(322, 27, 10, 10.0, 7.0, 13.0),
(323, 27, 11, 5.0, 3.0, 7.0),
(324, 27, 12, 2.0, 0.0, 4.0),
(325, 28, 1, 0.0, -5.0, 5.0),
(326, 28, 2, 2.0, -4.0, 7.0),
(327, 28, 3, 6.0, 0.0, 12.0),
(328, 28, 4, 11.0, 4.0, 18.0),
(329, 28, 5, 16.0, 8.0, 23.0),
(330, 28, 6, 20.0, 12.0, 27.0),
(331, 28, 7, 24.0, 15.0, 31.0),
(332, 28, 8, 24.0, 15.0, 31.0),
(333, 28, 9, 19.0, 10.0, 26.0),
(334, 28, 10, 13.0, 6.0, 20.0),
(335, 28, 11, 7.0, 1.0, 12.0),
(336, 28, 12, 2.0, -3.0, 6.0),
(337, 29, 1, 18.0, 14.0, 21.0),
(338, 29, 2, 18.0, 14.0, 22.0),
(339, 29, 3, 19.0, 15.0, 22.0),
(340, 29, 4, 20.0, 16.0, 23.0),
(341, 29, 5, 21.0, 17.0, 24.0),
(342, 29, 6, 23.0, 19.0, 27.0),
(343, 29, 7, 25.0, 21.0, 29.0),
(344, 29, 8, 26.0, 22.0, 30.0),
(345, 29, 9, 25.0, 21.0, 29.0),
(346, 29, 10, 23.0, 19.0, 26.0),
(347, 29, 11, 21.0, 17.0, 24.0),
(348, 29, 12, 19.0, 15.0, 22.0),
(349, 30, 1, -2.0, -6.0, 1.0),
(350, 30, 2, 0.0, -4.0, 3.0),
(351, 30, 3, 4.0, 0.0, 9.0),
(352, 30, 4, 9.0, 3.0, 15.0),
(353, 30, 5, 14.0, 8.0, 20.0),
(354, 30, 6, 18.0, 11.0, 23.0),
(355, 30, 7, 20.0, 13.0, 25.0),
(356, 30, 8, 19.0, 12.0, 24.0),
(357, 30, 9, 14.0, 8.0, 19.0),
(358, 30, 10, 9.0, 4.0, 14.0),
(359, 30, 11, 4.0, 0.0, 7.0),
(360, 30, 12, 0.0, -4.0, 2.0),
(361, 31, 1, 13.0, 10.0, 16.0),
(362, 31, 2, 13.0, 10.0, 16.0),
(363, 31, 3, 14.0, 11.0, 18.0),
(364, 31, 4, 16.0, 13.0, 20.0),
(365, 31, 5, 20.0, 16.0, 24.0),
(366, 31, 6, 24.0, 20.0, 29.0),
(367, 31, 7, 27.0, 23.0, 32.0),
(368, 31, 8, 28.0, 24.0, 32.0),
(369, 31, 9, 25.0, 22.0, 29.0),
(370, 31, 10, 22.0, 18.0, 26.0),
(371, 31, 11, 18.0, 14.0, 21.0),
(372, 31, 12, 14.0, 11.0, 17.0),
(373, 32, 1, -4.0, -7.0, -1.0),
(374, 32, 2, -4.0, -7.0, -1.0),
(375, 32, 3, -2.0, -5.0, 1.0),
(376, 32, 4, 1.0, -2.0, 4.0),
(377, 32, 5, 6.0, 2.0, 9.0),
(378, 32, 6, 10.0, 6.0, 14.0),
(379, 32, 7, 13.0, 9.0, 16.0),
(380, 32, 8, 12.0, 8.0, 15.0),
(381, 32, 9, 8.0, 5.0, 11.0),
(382, 32, 10, 3.0, 0.0, 5.0),
(383, 32, 11, -1.0, -4.0, 2.0),
(384, 32, 12, -3.0, -6.0, 0.0),
(385, 33, 1, 2.0, -2.0, 6.0),
(386, 33, 2, 3.0, -1.0, 8.0),
(387, 33, 3, 7.0, 2.0, 13.0),
(388, 33, 4, 12.0, 7.0, 18.0),
(389, 33, 5, 17.0, 11.0, 23.0),
(390, 33, 6, 21.0, 15.0, 27.0),
(391, 33, 7, 24.0, 18.0, 31.0),
(392, 33, 8, 24.0, 18.0, 30.0),
(393, 33, 9, 19.0, 14.0, 25.0),
(394, 33, 10, 13.0, 8.0, 18.0),
(395, 33, 11, 7.0, 3.0, 12.0),
(396, 33, 12, 3.0, -1.0, 7.0),
(397, 34, 1, 16.0, 13.0, 19.0),
(398, 34, 2, 16.0, 13.0, 19.0),
(399, 34, 3, 16.0, 13.0, 20.0),
(400, 34, 4, 17.0, 14.0, 20.0),
(401, 34, 5, 18.0, 15.0, 21.0),
(402, 34, 6, 20.0, 17.0, 23.0),
(403, 34, 7, 22.0, 19.0, 25.0),
(404, 34, 8, 23.0, 20.0, 26.0),
(405, 34, 9, 23.0, 20.0, 26.0),
(406, 34, 10, 21.0, 18.0, 24.0),
(407, 34, 11, 18.0, 16.0, 21.0),
(408, 34, 12, 17.0, 14.0, 19.0),
(409, 35, 1, 27.0, 22.0, 32.0),
(410, 35, 2, 28.0, 23.0, 33.0),
(411, 35, 3, 30.0, 25.0, 34.0),
(412, 35, 4, 31.0, 27.0, 35.0),
(413, 35, 5, 30.0, 26.0, 33.0),
(414, 35, 6, 29.0, 26.0, 33.0),
(415, 35, 7, 29.0, 25.0, 32.0),
(416, 35, 8, 29.0, 25.0, 32.0),
(417, 35, 9, 28.0, 25.0, 32.0),
(418, 35, 10, 28.0, 25.0, 31.0),
(419, 35, 11, 27.0, 24.0, 31.0),
(420, 35, 12, 26.0, 22.0, 31.0);

-- --------------------------------------------------------

--
-- Table structure for table `searches`
--

CREATE TABLE `searches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `destination_id` bigint(20) UNSIGNED DEFAULT NULL,
  `travel_month` tinyint(4) DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL,
  `types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`types`)),
  `temperature_pref` varchar(255) DEFAULT NULL,
  `distance_pref` varchar(255) DEFAULT NULL,
  `searched_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `searches`
--

INSERT INTO `searches` (`id`, `destination_id`, `travel_month`, `duration_days`, `types`, `temperature_pref`, `distance_pref`, `searched_at`) VALUES
(1, NULL, 4, 7, '[\"mountains\"]', 'warm', 'anywhere', '2026-05-06 14:36:43'),
(2, 29, 4, NULL, NULL, NULL, NULL, '2026-05-06 14:36:47'),
(3, NULL, 4, 7, '[\"historical\"]', 'warm', 'anywhere', '2026-05-06 14:40:21'),
(4, NULL, 6, 7, '[\"historical\"]', 'hot', '3h', '2026-05-07 18:04:08'),
(5, 25, 6, NULL, NULL, NULL, NULL, '2026-05-07 18:04:16'),
(6, 25, 6, NULL, NULL, NULL, NULL, '2026-05-07 18:04:18'),
(7, 25, 6, NULL, NULL, NULL, NULL, '2026-05-07 18:04:18'),
(8, 25, 6, NULL, NULL, NULL, NULL, '2026-05-07 18:04:18');

-- --------------------------------------------------------

--
-- Table structure for table `visits`
--

CREATE TABLE `visits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ip_hash` varchar(64) NOT NULL,
  `visited_at` timestamp NOT NULL,
  `time_slot` enum('morning','afternoon','evening','night') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visits`
--

INSERT INTO `visits` (`id`, `ip_hash`, `visited_at`, `time_slot`) VALUES
(1, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:34:43', 'afternoon'),
(2, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:34:46', 'afternoon'),
(3, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:23', 'afternoon'),
(4, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:28', 'afternoon'),
(5, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:43', 'afternoon'),
(6, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:47', 'afternoon'),
(7, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:51', 'afternoon'),
(8, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:53', 'afternoon'),
(9, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:36:56', 'afternoon'),
(10, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:37:21', 'afternoon'),
(11, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:37:22', 'afternoon'),
(12, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:37:22', 'afternoon'),
(13, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:37:44', 'afternoon'),
(14, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:39:08', 'afternoon'),
(15, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:40:14', 'afternoon'),
(16, '459fd27b82b88cfabf9d9bc4da412a245c2078e3961c500f0a65abf1a60e4fd5', '2026-05-06 14:40:16', 'afternoon'),
(17, 'c830be49246fba0bea20e21fbced55dea5035bab42ac367ba0c0b997798fb6fa', '2026-05-06 14:40:17', 'afternoon'),
(18, '7c8e2cb5e58830be77981646f84c51babea61b2225362c041c4d4cdbea1a2585', '2026-05-06 14:40:17', 'afternoon'),
(19, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:40:21', 'afternoon'),
(20, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:40:25', 'afternoon'),
(21, '65ab7b7fdaa90c464329ae94140102659caef88aab75ebdfa885a5ab141609d1', '2026-05-06 14:40:27', 'afternoon'),
(22, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 15:11:54', 'afternoon'),
(23, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 15:12:08', 'afternoon'),
(24, '459fd27b82b88cfabf9d9bc4da412a245c2078e3961c500f0a65abf1a60e4fd5', '2026-05-07 15:12:10', 'afternoon'),
(25, '75100b55d96b94360125514db496c96cca07f268b9c1d2040db1203635942c3d', '2026-05-07 15:12:10', 'afternoon'),
(26, '75100b55d96b94360125514db496c96cca07f268b9c1d2040db1203635942c3d', '2026-05-07 15:12:10', 'afternoon'),
(27, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 15:12:13', 'afternoon'),
(28, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 15:12:21', 'afternoon'),
(29, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:03:43', 'afternoon'),
(30, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:03:46', 'afternoon'),
(31, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:03:58', 'afternoon'),
(32, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:03:59', 'afternoon'),
(33, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:04:08', 'afternoon'),
(34, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:04:13', 'afternoon'),
(35, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:04:16', 'afternoon'),
(36, '2c0ef6cfaf7e8698860acd471c5ba3895ca6837b05687ca771da2e8b114fc1de', '2026-05-07 18:04:18', 'afternoon'),
(37, '75100b55d96b94360125514db496c96cca07f268b9c1d2040db1203635942c3d', '2026-05-07 18:04:18', 'afternoon'),
(38, '6fbb729598b1be9ee23eb8525ac941934d9c0b9b8dde388a7a7fa3af7217df0b', '2026-05-07 18:04:18', 'afternoon'),
(39, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:04:19', 'afternoon'),
(40, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:24', 'afternoon'),
(41, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:34', 'afternoon'),
(42, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:34', 'afternoon'),
(43, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:36', 'afternoon'),
(44, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:38', 'afternoon'),
(45, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:42', 'afternoon'),
(46, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:48', 'afternoon'),
(47, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:48', 'afternoon'),
(48, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:17:52', 'afternoon'),
(49, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:01', 'afternoon'),
(50, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:07', 'afternoon'),
(51, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:08', 'afternoon'),
(52, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:10', 'afternoon'),
(53, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:11', 'afternoon'),
(54, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:20', 'afternoon'),
(55, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:26', 'afternoon'),
(56, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:40', 'afternoon'),
(57, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:48', 'afternoon'),
(58, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:18:50', 'afternoon'),
(59, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:19:02', 'afternoon'),
(60, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:19:09', 'afternoon'),
(61, 'f7bde7f060cb94337161dbc91e4ce1067e6f37c02b346cb5c2ed1d11053e4f5f', '2026-05-07 18:19:42', 'afternoon'),
(62, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:20:00', 'afternoon'),
(63, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:20:09', 'afternoon'),
(64, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:20:17', 'afternoon'),
(65, 'f7bde7f060cb94337161dbc91e4ce1067e6f37c02b346cb5c2ed1d11053e4f5f', '2026-05-07 18:20:18', 'afternoon'),
(66, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:21:31', 'afternoon'),
(67, '6a286bf1a9bc3a6731220d05bc5ad6506e68f1c150299d7cc664baf1a99a614a', '2026-05-07 18:21:35', 'afternoon');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `destinations`
--
ALTER TABLE `destinations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `destination_types`
--
ALTER TABLE `destination_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `destination_types_destination_id_type_unique` (`destination_id`,`type`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monthly_weather`
--
ALTER TABLE `monthly_weather`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `monthly_weather_destination_id_month_unique` (`destination_id`,`month`);

--
-- Indexes for table `searches`
--
ALTER TABLE `searches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `searches_destination_id_foreign` (`destination_id`);

--
-- Indexes for table `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visits_ip_hash_index` (`ip_hash`),
  ADD KEY `visits_visited_at_index` (`visited_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `destinations`
--
ALTER TABLE `destinations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `destination_types`
--
ALTER TABLE `destination_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `monthly_weather`
--
ALTER TABLE `monthly_weather`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=421;

--
-- AUTO_INCREMENT for table `searches`
--
ALTER TABLE `searches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `visits`
--
ALTER TABLE `visits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `destination_types`
--
ALTER TABLE `destination_types`
  ADD CONSTRAINT `destination_types_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `monthly_weather`
--
ALTER TABLE `monthly_weather`
  ADD CONSTRAINT `monthly_weather_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `searches`
--
ALTER TABLE `searches`
  ADD CONSTRAINT `searches_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
