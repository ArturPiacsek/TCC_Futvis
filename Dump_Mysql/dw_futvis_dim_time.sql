CREATE DATABASE  IF NOT EXISTS `dw_futvis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dw_futvis`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: dw_futvis
-- ------------------------------------------------------
-- Server version	8.4.5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dim_time`
--

DROP TABLE IF EXISTS `dim_time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_time` (
  `id_time` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `sigla` varchar(10) NOT NULL,
  `logo_url_time` varchar(255) NOT NULL,
  PRIMARY KEY (`id_time`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_time`
--

LOCK TABLES `dim_time` WRITE;
/*!40000 ALTER TABLE `dim_time` DISABLE KEYS */;
INSERT INTO `dim_time` VALUES (1,'Bahia','BAH','https://media.api-sports.io/football/teams/118.png'),(2,'Internacional','INT','https://media.api-sports.io/football/teams/119.png'),(3,'Botafogo','BOT','https://media.api-sports.io/football/teams/120.png'),(4,'Palmeiras','PAL','https://media.api-sports.io/football/teams/121.png'),(5,'Sport Recife','SPO','https://media.api-sports.io/football/teams/123.png'),(6,'Fluminense','FLU','https://media.api-sports.io/football/teams/124.png'),(7,'America Mineiro','AME','https://media.api-sports.io/football/teams/125.png'),(8,'Sao Paulo','PAU','https://media.api-sports.io/football/teams/126.png'),(9,'Flamengo','FLA','https://media.api-sports.io/football/teams/127.png'),(10,'Santos','SAN','https://media.api-sports.io/football/teams/128.png'),(11,'Ceara','CEA','https://media.api-sports.io/football/teams/129.png'),(12,'Gremio','GRE','https://media.api-sports.io/football/teams/130.png'),(13,'Corinthians','COR','https://media.api-sports.io/football/teams/131.png'),(14,'Chapecoense-sc','CHA','https://media.api-sports.io/football/teams/132.png'),(15,'Vasco DA Gama','VAS','https://media.api-sports.io/football/teams/133.png'),(16,'Atletico Paranaense','ATL','https://media.api-sports.io/football/teams/134.png'),(17,'Cruzeiro','CRU','https://media.api-sports.io/football/teams/135.png'),(18,'Atletico Goianiense','ATL','https://media.api-sports.io/football/teams/144.png'),(19,'Avai','AVA','https://media.api-sports.io/football/teams/145.png'),(20,'Coritiba','COR','https://media.api-sports.io/football/teams/147.png'),(21,'Goias','GOI','https://media.api-sports.io/football/teams/151.png'),(22,'Juventude','JUV','https://media.api-sports.io/football/teams/152.png'),(23,'Fortaleza EC','FOR','https://media.api-sports.io/football/teams/154.png'),(24,'RB Bragantino','BRA','https://media.api-sports.io/football/teams/794.png'),(25,'Atletico-MG','ATL','https://media.api-sports.io/football/teams/1062.png'),(26,'Cuiaba','CUI','https://media.api-sports.io/football/teams/1193.png');
/*!40000 ALTER TABLE `dim_time` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-04 13:45:31
