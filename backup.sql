-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: purgatory_db
-- ------------------------------------------------------
-- Server version       8.0.45-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bank`
--

DROP TABLE IF EXISTS `bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank` (
  `player_name` varchar(255) NOT NULL,
  `id` int NOT NULL,
  `amount` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`player_name`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank`
--

LOCK TABLES `bank` WRITE;
/*!40000 ALTER TABLE `bank` DISABLE KEYS */;
INSERT INTO `bank` VALUES (' ',21,5),('1',21,5),('11',21,5),('12',21,5),('123',21,5),('13',21,5),('1321',21,5),('132132',21,5),('14',21,5),('2',21,5),('25523',21,5),('3',21,5),('414',21,5),('44',21,5),('442',21,5),('5151',21,5),('555',21,5),('5615',21,5),('56151',21,5),('666',21,5),('6ysdf',21,5),('a',21,5),('ad ',21,5),('ada',21,5),('adas',21,5),('Admin',2,172),('Admin',3,1),('Admin',4,3263),('Admin',7,771),('Admin',8,47),('Admin',10,1),('Admin',11,7),('Admin',15,2),('Admin',20,369),('Admin',21,10),('Admin',22,6),('Admin',23,16),('Admin',24,2),('Admin',25,9),('Admin',26,16),('Admin',28,13),('Admin',33,3),('Admin',34,18),('Admin',35,1),('Admin',38,126),('Admin',40,1),('Admin',41,1),('Admin',44,65),('Admin',45,16),('Admin',47,35),('Admin',49,4),('Admin',64,1),('Admin',75,1),('Admin',82,134),('Admin',86,1),('Admin',92,34),('Admin',94,15),('Admin',96,4),('Admin',103,3),('Admin',104,2),('Admin',107,2),('Admin',108,10),('Admin',109,24),('Admin',110,19),('Admin',111,13),('Admin',112,23),('Admin',113,29),('adsda',21,5),('adwad',21,5),('af',21,5),('afa',21,5),('afgasf',21,5),('afsf',21,5),('afssaf',21,5),('almaziel',2,51824),('almaziel',3,194),('almaziel',4,47137),('almaziel',5,2),('almaziel',7,934),('almaziel',8,1122),('almaziel',9,530),('almaziel',10,2),('almaziel',11,613),('almaziel',13,127),('almaziel',16,21),('almaziel',17,13),('almaziel',18,16),('almaziel',19,13),('almaziel',20,2),('almaziel',21,383),('almaziel',22,53),('almaziel',23,1),('almaziel',25,137),('almaziel',26,55),('almaziel',27,93),('almaziel',28,8),('almaziel',29,1),('almaziel',30,1),('almaziel',31,5),('almaziel',32,5),('almaziel',36,141),('almaziel',37,2),('almaziel',38,1),('almaziel',39,1),('almaziel',40,46),('almaziel',41,38),('almaziel',42,31),('almaziel',44,535),('almaziel',45,254),('almaziel',46,8),('almaziel',47,416),('almaziel',48,58),('almaziel',62,1),('almaziel',66,10),('almaziel',68,1),('almaziel',71,10),('almaziel',81,1),('almaziel',82,9),('Almighty Pumpkin',2,343),('Almighty Pumpkin',3,2),('Almighty Pumpkin',4,100),('Almighty Pumpkin',5,449),('Almighty Pumpkin',6,438),('Almighty Pumpkin',7,24),('Almighty Pumpkin',8,200),('Almighty Pumpkin',9,9),('Almighty Pumpkin',10,1),('Almighty Pumpkin',11,47),('Almighty Pumpkin',13,16),('Almighty Pumpkin',15,22),('Almighty Pumpkin',17,72),('Almighty Pumpkin',18,71),('Almighty Pumpkin',19,64),('Almighty Pumpkin',20,21),('Almighty Pumpkin',21,344),('Almighty Pumpkin',22,151),('Almighty Pumpkin',23,26),('Almighty Pumpkin',25,20),('Almighty Pumpkin',26,26),('Almighty Pumpkin',27,57),('Almighty Pumpkin',33,1),('Almighty Pumpkin',34,3),('Almighty Pumpkin',38,1),('Almighty Pumpkin',39,1),('Almighty Pumpkin',40,56),('Almighty Pumpkin',41,50),('Almighty Pumpkin',42,72),('Almighty Pumpkin',43,2),('Almighty Pumpkin',44,104),('Almighty Pumpkin',45,1),('Almighty Pumpkin',46,22),('Almighty Pumpkin',47,46),('Almighty Pumpkin',48,2),('Almighty Pumpkin',49,41),('Almighty Pumpkin',51,16),('Almighty Pumpkin',52,1),('Almighty Pumpkin',54,1),('Almighty Pumpkin',67,1),('Almighty Pumpkin',68,1),('Almighty Pumpkin',73,1),('Almighty Pumpkin',80,1),('as',21,5),('asd',21,5),('asd ',21,5),('asdad',21,5),('asdadas',21,5),('asdag',21,5),('asdas',21,5),('asdaw',21,5),('asdd',21,5),('asdfasd',21,5),('asds',21,5),('asfa',21,5),('asfdasd',21,5),('BirdtheBandit',2,15972),('BirdtheBandit',3,42),('BirdtheBandit',4,18020),('BirdtheBandit',5,3),('BirdtheBandit',6,8074),('BirdtheBandit',7,7346),('BirdtheBandit',8,1031),('BirdtheBandit',9,1441),('BirdtheBandit',10,7),('BirdtheBandit',11,1077),('BirdtheBandit',12,3299),('BirdtheBandit',13,3144),('BirdtheBandit',14,1467),('BirdtheBandit',15,2375),('BirdtheBandit',16,152),('BirdtheBandit',17,68),('BirdtheBandit',18,79),('BirdtheBandit',19,61),('BirdtheBandit',20,529),('BirdtheBandit',21,1497),('BirdtheBandit',22,988),('BirdtheBandit',23,545),('BirdtheBandit',24,1),('BirdtheBandit',25,1333),('BirdtheBandit',26,712),('BirdtheBandit',27,907),('BirdtheBandit',29,10),('BirdtheBandit',30,21),('BirdtheBandit',31,37),('BirdtheBandit',32,24),('BirdtheBandit',34,82),('BirdtheBandit',36,3925),('BirdtheBandit',37,27),('BirdtheBandit',38,52),('BirdtheBandit',40,334),('BirdtheBandit',41,298),('BirdtheBandit',42,96),('BirdtheBandit',43,8),('BirdtheBandit',44,2122),('BirdtheBandit',45,404),('BirdtheBandit',46,124),('BirdtheBandit',47,616),('BirdtheBandit',48,259),('BirdtheBandit',49,112),('BirdtheBandit',50,18),('BirdtheBandit',51,4),('BirdtheBandit',53,4),('BirdtheBandit',54,3),('BirdtheBandit',55,1),('BirdtheBandit',57,10),('BirdtheBandit',58,17),('BirdtheBandit',59,18),('BirdtheBandit',66,2),('BirdtheBandit',67,1),('BirdtheBandit',68,2),('BirdtheBandit',69,2),('BirdtheBandit',71,5),('BirdtheBandit',73,1),('BirdtheBandit',74,1),('BirdtheBandit',76,40),('BirdtheBandit',79,5),('BirdtheBandit',80,157),('BirdtheBandit',83,1),('BirdtheBandit',84,1371),('BirdtheBandit',85,1391),('BirdtheBandit',86,1),('BirdtheBandit',87,1),('BirdtheBandit',89,3),('BirdtheBandit',91,170),('BirdtheBandit',92,878),('BirdtheBandit',94,606),('BirdtheBandit',95,19),('BirdtheBandit',96,38),('BirdtheBandit',103,72),('BirdtheBandit',107,761),('BirdtheBandit',108,12),('BirdtheBandit',109,17),('BirdtheBandit',110,14),('BirdtheBandit',111,6),('BirdtheBandit',112,3),('BirdtheBandit',113,38),('BirdtheBandit',116,13),('BirdtheBandit',117,16),('BirdtheBandit',118,18),('BirdtheBandit',119,107),('BirdtheBandit',120,73),('BirdtheBandit',121,25),('Blah',21,5),('Blah2',21,5),('Blah3',21,5),('Bob',21,5),('Bongus',21,5),('Bungus',21,5),('dad',21,5),('dafga',21,5),('Dan',2,9371),('Dan',4,930),('Dan',8,2),('Dan',9,8),('Dan',10,1),('Dan',11,72),('Dan',19,1),('Dan',20,1),('Dan',21,5),('Dan',22,244),('dasd',21,5),('deadlysin',2,8540),('deadlysin',3,5),('deadlysin',4,371512),('deadlysin',5,2),('deadlysin',6,962),('deadlysin',7,20892),('deadlysin',8,6),('deadlysin',9,62),('deadlysin',10,4),('deadlysin',11,109),('deadlysin',16,23),('deadlysin',17,1),('deadlysin',18,5),('deadlysin',20,1712),('deadlysin',21,56820),('deadlysin',23,2690),('deadlysin',24,19),('deadlysin',27,9771),('deadlysin',31,3),('deadlysin',32,3),('deadlysin',34,1),('deadlysin',35,10),('deadlysin',36,2393),('deadlysin',38,1567),('deadlysin',40,52),('deadlysin',41,60),('deadlysin',42,5),('deadlysin',44,586),('deadlysin',45,433),('deadlysin',47,403),('deadlysin',49,2089),('deadlysin',50,408),('deadlysin',51,46),('deadlysin',52,152),('deadlysin',58,1),('deadlysin',62,1),('deadlysin',66,1),('deadlysin',67,1),('deadlysin',71,1),('deadlysin',76,6),('deadlysin',80,7),('deadlysin',82,2),('deadlysin',89,4),('deadlysin',91,52),('deadlysin',92,7),('deadlysin',94,3),('deadlysin',96,9),('deadlysin',104,4),('deadlysin',105,1),('deadlysin',107,100),('deadlysin',108,12),('deadlysin',109,15),('deadlysin',110,11),('deadlysin',111,18),('deadlysin',112,21),('deadlysin',113,40),('deadlysin',116,1),('deadlysin',118,3),('deadlysin',119,29),('deadlysin',120,19),('deadlysin',121,11),('dfasd',21,5),('Dingus',21,5),('Dude',21,5),('east',2,50),('east',4,6),('fafa',21,5),('fafs',21,5),('fasasfasf',21,5),('fasf',21,5),('ff',21,5),('fffasf',21,5),('fgff',21,5),('gag',21,5),('gamestopher',10,1),('gamestopher',21,7),('gasdga',21,5),('gdfg',21,5),('ghsdf',21,5),('gsdg',21,5),('gsg',21,5),('gsgsd',21,5),('hai',21,5),('hasdf',21,5),('hs',21,5),('hshg',21,5),('JWKnight',21,5),('kel',21,5),('kelatan',21,5),('keldamyr',2,411),('keldamyr',4,473),('keldamyr',5,1),('keldamyr',6,100),('keldamyr',7,100),('keldamyr',8,8),('keldamyr',9,38),('keldamyr',12,50),('keldamyr',15,100),('keldamyr',23,15),('keldamyr',25,45),('keldamyr',26,22),('keldamyr',27,2),('keldamyr',36,1),('keldamyr',44,36),('keldamyr',47,4),('Klinthios',2,101),('Klinthios',3,2),('Klinthios',4,397),('Klinthios',5,1),('Klinthios',7,74),('Klinthios',8,7),('Klinthios',11,4),('Klinthios',14,9),('Klinthios',17,2),('Klinthios',18,4),('Klinthios',19,4),('Klinthios',21,1945),('Klinthios',25,121),('Klinthios',26,55),('Klinthios',27,10),('Klinthios',35,1),('Klinthios',36,1),('Klinthios',40,238),('Klinthios',41,242),('Klinthios',42,33),('Klinthios',44,1716),('Klinthios',91,191),('Klinthios',94,37),('Klinthios',95,1),('Klinthios',99,16),('Klinthios',104,5),('Klinthios',126,20),('Klinthios',127,13),('Klinthios',128,12),('mai',21,5),('mia',21,5),('MissMiia',21,5),('notagain',3,1),('notagain',4,1),('notagain',6,154),('notagain',7,1),('notagain',23,8),('notagain',26,10),('notagain',37,1),('notagain',39,2),('øæaøsædlæøæ',21,5),('qa',21,5),('qef',21,5),('qweqwe',21,5),('s ',21,5),('sdad',21,5),('sddsafr',21,5),('T',21,5),('Theunorg',2,8371),('Theunorg',3,22),('Theunorg',5,35),('Theunorg',6,7879),('Theunorg',7,1546),('Theunorg',10,1),('Theunorg',11,132),('Theunorg',12,145),('Theunorg',13,87),('Theunorg',14,86),('Theunorg',15,118),('Theunorg',16,73),('Theunorg',17,24),('Theunorg',18,23),('Theunorg',19,24),('Theunorg',20,177),('Theunorg',22,913),('Theunorg',23,143),('Theunorg',24,1),('Theunorg',25,101),('Theunorg',26,76),('Theunorg',27,284),('Theunorg',28,13),('Theunorg',30,39),('Theunorg',33,3),('Theunorg',34,2),('Theunorg',36,7131),('Theunorg',37,1),('Theunorg',38,3),('Theunorg',40,1),('Theunorg',41,2),('Theunorg',42,2),('Theunorg',44,94),('Theunorg',45,20),('Theunorg',47,58),('Theunorg',49,20),('Theunorg',51,8),('Theunorg',66,1),('Theunorg',71,1),('Theunorg',84,5),('Tres',21,5),('tunafist',2,84),('tunafist',4,1),('tunafist',5,1),('tunafist',17,4),('tunafist',18,1),('tunafist',19,4),('tunafist',25,22),('tunafist',26,12),('west',21,9000),('Yasha',2,6381),('Yasha',4,37702),('Yasha',5,680),('Yasha',6,53),('Yasha',7,3272),('Yasha',8,908),('Yasha',9,639),('Yasha',10,6),('Yasha',11,24),('Yasha',12,34),('Yasha',13,233),('Yasha',14,1),('Yasha',15,423),('Yasha',16,4),('Yasha',17,3),('Yasha',18,6),('Yasha',19,4),('Yasha',20,3),('Yasha',23,245),('Yasha',24,7),('Yasha',25,96),('Yasha',26,2230),('Yasha',27,1187),('Yasha',28,130),('Yasha',29,3),('Yasha',31,1),('Yasha',32,1),('Yasha',34,4),('Yasha',35,2),('Yasha',36,134),('Yasha',37,1),('Yasha',38,2),('Yasha',39,2),('Yasha',40,4),('Yasha',41,1),('Yasha',42,17),('Yasha',44,3056),('Yasha',45,212),('Yasha',46,100),('Yasha',47,1082),('Yasha',48,157),('Yasha',49,91),('Yasha',50,1),('Yasha',51,52),('Yasha',53,2),('Yasha',54,2),('Yasha',55,1),('Yasha',56,1),('Yasha',57,2),('Yasha',60,1),('Yasha',61,1),('Yasha',63,1),('Yasha',64,1),('Yasha',65,1),('Yasha',68,4),('Yasha',73,4),('Yasha',74,2),('Yasha',79,241),('Yasha',80,1),('Yasha',81,7),('Yasha',83,85),('Yasha',84,290),('Yasha',85,213),('Yasha',86,1),('Yasha',89,3),('Yasha',92,2),('Yasha',96,34),('Yasha',105,34),('Yasha',107,835),('Yasha',126,1),('Yasha',127,2),('Yasha',128,1);
/*!40000 ALTER TABLE `bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `player_name` varchar(64) NOT NULL,
  `id` int NOT NULL,
  `amount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`player_name`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (' ',1,1),('1',1,1),('11',1,1),('12',1,1),('123',1,1),('13',1,1),('1321',1,1),('132132',1,1),('132132',2,32),('132132',3,2),('132132',4,56),('132132',5,2),('132132',8,8),('1337',1,1),('14',1,1),('2',1,1),('25523',1,1),('3',1,1),('3',2,7),('3',3,1),('3',4,5),('3',5,1),('414',1,1),('44',1,1),('442',1,1),('5151',1,1),('54',1,1),('555',1,1),('5615',1,1),('56151',1,1),('666',1,1),('6ysdf',1,1),('a',1,1),('Abc',1,1),('Abc',2,17),('ad ',1,1),('ada',1,1),('aDabbleDooYa',1,1),('adas',1,1),('Admin',1,4),('Admin',2,14),('Admin',3,1),('Admin',4,10),('Admin',8,1),('Admin',21,149),('Admin',22,1),('Admin',23,4),('Admin',28,7),('Admin',35,1),('Admin',56,1),('Admin',60,1),('Admin',64,1),('Admin',87,1),('Admin',96,1),('Admin',119,4),('Admin',122,1),('Admin ',1,1),('adsda',1,1),('adwad',1,1),('af',1,1),('afa',1,1),('afgasf',1,1),('afsf',1,1),('afssaf',1,1),('almaziel',1,1),('almaziel',4,2005),('almaziel',8,26),('almaziel',22,50),('almaziel',36,25),('almaziel',39,1),('almaziel',44,776),('almaziel',45,8),('almaziel',47,20),('almaziel',54,1),('almaziel',58,1),('almaziel',65,1),('almaziel',73,1),('almaziel',80,1),('Almighty Pumpkin',1,1),('as',1,1),('asd',1,1),('asd ',1,1),('asdad',1,1),('asdadas',1,1),('asdadas',2,2),('asdag',1,1),('asdas',1,1),('asdaw',1,1),('asdd',1,1),('asdfasd',1,1),('asds',1,1),('asfa',1,1),('asfdasd',1,1),('Bad Apple Bot',1,1),('Bad Apple Bot',2,2),('Beepus',1,1),('Beepus',2,3),('Beepus',87,1),('Beepus',94,4),('BirdtheBandit',1,116),('BirdtheBandit',2,1940),('BirdtheBandit',4,65),('BirdtheBandit',8,12),('BirdtheBandit',11,328),('BirdtheBandit',18,1),('BirdtheBandit',21,133),('BirdtheBandit',22,32),('BirdtheBandit',23,56),('BirdtheBandit',25,191),('BirdtheBandit',26,135),('BirdtheBandit',27,210),('BirdtheBandit',28,232),('BirdtheBandit',36,899),('BirdtheBandit',39,1),('BirdtheBandit',40,4),('BirdtheBandit',41,6),('BirdtheBandit',42,7),('BirdtheBandit',44,4),('BirdtheBandit',59,1),('BirdtheBandit',64,1),('BirdtheBandit',65,1),('BirdtheBandit',70,1),('BirdtheBandit',75,1),('BirdtheBandit',96,8),('BirdtheBandit',105,11),('BirdtheBandit',106,615),('BirdtheBandit',107,4),('BirdtheBandit',116,1),('BirdtheBandit',117,2),('BirdtheBandit',118,3),('Blah',1,1),('Blah2',1,1),('Blah3',1,1),('Bob',1,1),('Bongle',1,1),('Bongus',1,1),('Bongus',2,4),('Bongus',3,1),('Bongus',4,8),('Bongus',5,1),('Booble',1,1),('Booble',2,1),('Bungus',1,1),('Calkds',1,1),('Chudley',1,1),('dad',1,1),('dafga',1,1),('Dan',1,1),('Dan',2,12),('Dan',3,1),('Dan',4,48),('Dan',5,1),('Dan',8,15),('Dan',21,2),('dasd',1,1),('deadlysin',1,20),('deadlysin',2,918),('deadlysin',4,2466),('deadlysin',7,938),('deadlysin',21,799),('deadlysin',22,492),('deadlysin',23,8),('deadlysin',25,9423),('deadlysin',26,3050),('deadlysin',27,243),('deadlysin',28,5),('deadlysin',34,7),('deadlysin',35,1),('deadlysin',37,1),('deadlysin',38,161),('deadlysin',44,5),('deadlysin',45,5),('deadlysin',47,4),('deadlysin',56,1),('deadlysin',60,1),('deadlysin',64,1),('deadlysin',70,1),('deadlysin',75,1),('deadlysin',78,1415),('deadlysin',79,681),('deadlysin',80,1),('deadlysin',81,131),('deadlysin',96,1),('DengDawng',1,1),('dfasd',1,1),('dingle',1,1),('Dingus',1,1),('Dude',1,1),('fafa',1,1),('fafs',1,1),('fasasfasf',1,1),('fasf',1,1),('ff',1,1),('fffasf',1,1),('fgff',1,1),('Fuckhead',1,1),('Gabriel',1,1),('gag',1,1),('gamestopher',1,1),('gamestopher',2,65),('gamestopher',3,1),('gamestopher',4,78),('gamestopher',5,1),('gamestopher',8,2),('gamestopher',21,7),('gamestopher',23,4),('gasdga',1,1),('gdfg',1,1),('GersydbgRTFEv',1,1),('ghsdf',1,1),('Gorgon2',1,1),('Gorgon2',2,7),('Gorgon2',22,1),('gsdg',1,1),('gsg',1,1),('gsgsd',1,1),('GXZO',1,1),('GXZO\'QAOtWh<\'\">TunSgT',1,1),('GXZO\",),(,(\'((',1,1),('hai',1,1),('hasdf',1,1),('hs',1,1),('hshg',1,1),('Jimbob',1,1),('JoxerTheMighty',1,1),('JoxerTheMighty',2,12),('JoxerTheMighty',22,1),('JWKnight',1,1),('JWKnight',2,110),('JWKnight',17,1),('kal',1,1),('kel',1,1),('kel',2,49),('kelatan',1,1),('keldamyr',1,7),('keldamyr',2,440),('keldamyr',3,1),('keldamyr',4,8272),('keldamyr',8,98),('keldamyr',9,1),('keldamyr',10,1),('keldamyr',21,19),('keldamyr',22,2),('keldamyr',23,2),('keldamyr',25,6),('keldamyr',27,2),('keldamyr',31,1),('keldamyr',32,1),('keldamyr',44,20),('keldamyr',47,52),('keldamyr',96,1),('Klinthios',1,6),('Klinthios',2,4),('Klinthios',3,1),('Klinthios',4,4),('Klinthios',9,2),('Klinthios',39,1),('Klinthios',87,1),('Klinthios',91,59),('Klinthios',92,7),('Klinthios',94,59),('mai',1,1),('mai',5,11),('mia',1,1),('MissMiia',1,1),('MissMiia',2,204),('notagain',1,2),('notagain',11,24),('notagain',21,39),('notagain',22,28),('notagain',31,1),('notagain',32,1),('notagain',37,1),('notagain',64,1),('øæaøsædlæøæ',1,1),('øæaøsædlæøæ',2,24),('PauloAce261',1,1),('PauloAce261',3,2),('PauloAce261',4,66),('PauloAce261',5,1),('PauloAce261',8,12),('PauloAce261',21,3),('PauloAce261',23,1),('PauloAce261',44,8),('PauloAce261',45,9),('PauloAce261',47,12),('PauloAce261',49,4),('qa',1,1),('qef',1,1),('qweqwe',1,1),('s ',1,1),('santyyycama',1,1),('sdad',1,1),('sddsafr',1,1),('sdf',1,1),('SirBalls',1,1),('SirBalls',2,21),('T',1,1),('T',2,235),('Testing123',1,1),('Testing123',2,8),('Testing123',22,1),('Testing1234',1,1),('Theunorg',1,1),('Theunorg',10,1),('Theunorg',11,56),('Theunorg',22,80),('Theunorg',28,4),('Theunorg',31,1),('Theunorg',32,1),('Tjalmann',1,1),('Tres',1,1),('Tres',2,3),('Tres',3,1),('Tres',4,12),('tunafist',1,1),('tunafist',2,171),('tunafist',3,1),('tunafist',4,199),('tunafist',8,15),('tunafist',9,1),('tunafist',10,1),('tunafist',11,16),('tunafist',21,9),('tunafist',23,4),('tunafist',25,1),('tunafist',29,1),('tunafist',32,1),('tyleler',1,1),('tyllerhello',1,1),('tyllerhello',2,3),('Wompus',1,1),('Yasha',1,8),('Yasha',2,11),('Yasha',3,1),('Yasha',21,91),('Yasha',23,2),('Yasha',24,1),('Yasha',25,45),('Yasha',26,33),('Yasha',59,1),('zorb',1,1),('じゃがいも',1,1);
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `king_history`
--

DROP TABLE IF EXISTS `king_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `king_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `kingdom` varchar(20) NOT NULL,
  `start` bigint NOT NULL,
  `end` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `king_history`
--

LOCK TABLES `king_history` WRITE;
/*!40000 ALTER TABLE `king_history` DISABLE KEYS */;
INSERT INTO `king_history` VALUES (1,'BirdtheBandit','east',1774317142092,NULL),(2,'deadlysin','west',1774317553704,1775758786224),(3,'Yasha','west',1775758786224,1775955748958),(4,'deadlysin','west',1775955748958,NULL);
/*!40000 ALTER TABLE `king_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kingdoms`
--

DROP TABLE IF EXISTS `kingdoms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kingdoms` (
  `kingdom` varchar(20) NOT NULL,
  `king` varchar(100) DEFAULT NULL,
  `guards` int NOT NULL DEFAULT '0',
  `tax` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`kingdom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kingdoms`
--

LOCK TABLES `kingdoms` WRITE;
/*!40000 ALTER TABLE `kingdoms` DISABLE KEYS */;
INSERT INTO `kingdoms` VALUES ('east','BirdtheBandit',7,10),('west','deadlysin',12,5);
/*!40000 ALTER TABLE `kingdoms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `player_name` varchar(50) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT '0',
  `x` int DEFAULT '0',
  `y` int DEFAULT '0',
  `hpXp` int NOT NULL DEFAULT '0',
  `swordXp` int NOT NULL DEFAULT '0',
  `craftXp` int NOT NULL DEFAULT '0',
  `woodcuttingXp` int NOT NULL DEFAULT '0',
  `miningXp` int NOT NULL DEFAULT '0',
  `hp` int NOT NULL DEFAULT '100',
  `murderer` tinyint(1) NOT NULL DEFAULT '0',
  `murderTimer` bigint NOT NULL DEFAULT '0',
  `criminal` tinyint(1) NOT NULL DEFAULT '0',
  `criminalTimer` bigint NOT NULL DEFAULT '0',
  `archeryXp` int NOT NULL DEFAULT '0',
  `fishingXp` int NOT NULL DEFAULT '0',
  `head` int DEFAULT NULL,
  `body` int DEFAULT NULL,
  `hand` int DEFAULT NULL,
  `feet` int DEFAULT NULL,
  `quiver` int DEFAULT NULL,
  `mageXp` int NOT NULL DEFAULT '0',
  `mana` int NOT NULL DEFAULT '100',
  `z` int NOT NULL DEFAULT '0',
  `trollQuest` tinyint unsigned NOT NULL DEFAULT '0',
  `cookingXp` int NOT NULL DEFAULT '0',
  `chefQuest` tinyint unsigned NOT NULL DEFAULT '0',
  `farmingXp` int NOT NULL DEFAULT '0',
  `farmerQuest` tinyint unsigned NOT NULL DEFAULT '0',
  `king` varchar(20) DEFAULT NULL,
  `kingDate` bigint DEFAULT NULL,
  UNIQUE KEY `player_name` (`player_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (' ','1234',0,42,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('1','1',0,42,83,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('11','11',0,49,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('12','2121',0,53,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('123','313',0,45,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('13','13',0,52,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('1321','asd',0,48,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('132132','132132',0,47,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('1337','1337',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('14','14',0,52,59,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('2','2',0,42,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('25523','5235',0,51,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('3','3',0,52,59,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('414','2143124',0,50,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('44','44',1,45,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('442','3343',0,52,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('5151','123',0,48,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('54','41453',0,48,50,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('555',' 555',0,51,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('5615','7 dfh',0,51,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('56151','54273',0,49,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('666','342',0,38,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('6ysdf','43265',1,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('a','a',0,49,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Abc','abc',0,226,59,0,0,0,17,0,56,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('ad ','5256',0,50,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('ada','adsds',1,49,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('aDabbleDooYa','raids4thewin!',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('adas','ghsdgh',0,49,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Admin','654321',0,27,303,10001379,101410,100069,100373,100087,2000,0,0,0,0,1000050,100000,56,60,NULL,35,NULL,100000,1000,0,3,6,9,690,7,NULL,NULL),('Admin ','123',0,40,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('adsda','asfag',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('adwad','asd',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('af','fas',1,49,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('afa',' hdh',0,52,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('afgasf','asfs',0,54,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('afsf','asda',0,49,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('afssaf','asf',0,49,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('almaziel','osrs4eva',0,35,50,1433,1433,13448,6252,16433,123,0,0,0,0,619,999,54,58,73,NULL,36,13,0,0,0,0,0,0,0,NULL,NULL),('Almighty Pumpkin','ddvvllss',0,34,49,2581,2581,6419,4514,1952,134,0,0,0,0,0,1760,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('as','asd',0,52,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asd','asd',0,45,47,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asd ','faws',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdad','asd',0,48,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdadas','asdad',0,47,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdag','gasd',0,49,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdas','asdaf',0,47,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdaw','dads',0,49,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdd','asddd',0,60,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asdfasd','dassd',0,48,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asds','fasf',0,47,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asfa','fasf',0,52,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('asfdasd','asd',0,49,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Bad Apple Bot','ddvvllss',0,15,56,0,0,0,2,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Beepus','123',0,43,54,0,0,0,3,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('BirdtheBandit','skullfucker69',0,49,49,22363,21151,166904,61137,63796,173,0,0,0,0,3825,8081,114,59,65,NULL,36,113,104,0,4,302,9,65680,5,'east',NULL),('Blah','Improvethegamepls',0,41,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Blah2','Cannediss',1,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Blah3','Mymemorysucks',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Bob','123456',1,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Bongle','123',0,55,67,0,0,0,0,0,80,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,1,0,0,0,0,NULL,NULL),('Bongus','123',0,38,50,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Booble','123',1,51,67,0,0,0,1,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Bungus','123',0,49,50,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Calkds','BlackCat1',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Chudley','123',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('dad','sdsd',0,49,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('dafga','asfad',0,49,50,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Dan','54321',0,32,56,7,7,0,4560,4335,79,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('dasd','sds',0,49,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('deadlysin','deadlysin',0,34,49,47076,42605,154624,6315,24381,234,0,0,0,0,12790,1330,115,60,NULL,35,79,1693,8,0,4,57,9,0,0,'west',NULL),('DengDawng','123',0,42,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('dfasd','ggs',0,49,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('dingle','Habber',0,48,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Dingus','123',0,50,50,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Dude','12345',1,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('fafa','afaf',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('fafs','fasf',0,53,57,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('fasasfasf','afsfsafas',0,67,85,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('fasf','asdawd ',0,59,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('ff','fa',0,50,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('fffasf','asf',0,49,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('fgff','ffgdgh',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Fuckhead','123',0,26,54,0,0,0,0,0,102,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Gabriel','iscool',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gag','gsg',0,50,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gamestopher','1234qwer',0,36,50,32,32,0,0,0,8,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gasdga','agssd',0,48,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gdfg','dfg',0,49,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('GersydbgRTFEv','tS95kng*S543kjgfdsERFdf',0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('ghsdf','sdfsf',0,51,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Gorgon','4321',0,32,54,0,0,0,0,0,64,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Gorgon2','4321',0,79,52,0,0,98,210,57,102,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gsdg','3fds',0,55,57,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gsg','asd',0,49,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('gsgsd','sdg',0,49,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('GXZO','ubrs',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('GXZO\'QAOtWh<\'\">TunSgT','ubrs',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('GXZO\",),(,(\'((','ubrs',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('hai','91112610q',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('hasdf','asda',0,49,51,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('hs','sdf',0,49,50,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('hshg','sdf',0,48,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Jimbob','123',0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('JoxerTheMighty','Reinokoira08!',0,4,111,0,0,0,12,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('JWKnight','Sucksatpainting',0,145,198,56,56,0,171,135,73,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('kal','1234',0,39,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('kel','12345',0,33,45,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('kelatan','abcde',0,53,36,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Keldamyr','canvas12',0,145,52,472,472,2898,191,3168,61,0,0,0,0,0,0,32,31,3,NULL,NULL,0,100,0,1,0,1,0,0,NULL,NULL),('Klinthios','theunorg123',0,8,60,607,607,517,202,139,94,0,0,0,0,0,8758,NULL,NULL,NULL,NULL,NULL,0,100,0,0,269,9,480,7,NULL,NULL),('mai','mia',0,61,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('mia','mia',0,85,75,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('MissMiia','Gaming',0,58,84,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('notagain','player123',0,250,15,98,98,1662,7650,125,84,0,0,0,0,21,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('øæaøsædlæøæ','asdfdaf',0,54,58,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('PauloAce261','heavyman1253!',0,43,63,9,9,10,10,111,68,0,0,0,0,0,0,NULL,NULL,5,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('qa','ad',0,55,59,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('qef','fqs',0,51,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('qweqwe','4214',0,48,55,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('s ','6t2346',0,49,56,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('santyyycama','Santy003',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('sdad','fafa',1,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('sddsafr','adsd',0,50,54,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('sdf','123',0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('SirBalls','kylie2002',0,25,17,0,0,0,41,0,76,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('T','123456',0,40,53,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Testing123','ddvvllss',0,29,49,0,0,0,12,0,12,0,0,0,0,0,0,NULL,NULL,1,NULL,NULL,0,100,0,0,0,1,0,0,NULL,NULL),('Testing1234','ddvvllss',0,49,52,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Theunorg','123456',0,25,52,3253,3253,3691,26506,5241,138,0,0,0,0,50,157,32,31,1,NULL,NULL,0,100,0,0,6,9,0,0,NULL,NULL),('Tjalmann','NotSecure',0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Tres','Tres',0,43,51,11,11,5,56,275,62,0,0,0,0,0,0,NULL,NULL,3,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('tunafist','Zooyork228',0,44,54,186,186,0,278,242,35,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('tyleler','9064tut',0,61,73,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('tyllerhello','8356yes',0,60,60,0,0,0,5,0,36,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,1,0,0,0,0,NULL,NULL),('Wompus','123',0,57,68,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL),('Yasha','MagicianOfLublin',0,15,303,19641,19638,54353,1645,33332,188,0,0,0,0,45,198,NULL,59,NULL,NULL,NULL,0,100,0,4,6,9,0,0,NULL,NULL),('zorb','Saveelijah12',0,29,54,4,4,3,34,353,102,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,1,0,1,0,0,NULL,NULL),('���ゃがいも','password',0,49,49,0,0,0,0,0,100,0,0,0,0,0,0,NULL,NULL,NULL,NULL,NULL,0,100,0,0,0,0,0,0,NULL,NULL);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'purgatory_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12  5:14:29
