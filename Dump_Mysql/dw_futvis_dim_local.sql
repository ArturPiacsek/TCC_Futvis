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
-- Table structure for table `dim_local`
--

DROP TABLE IF EXISTS `dim_local`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dim_local` (
  `id_local` int NOT NULL AUTO_INCREMENT,
  `nome_estadio` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `pais` varchar(100) NOT NULL,
  `logo_url_estadio` varchar(255) NOT NULL,
  PRIMARY KEY (`id_local`)
) ENGINE=InnoDB AUTO_INCREMENT=171 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dim_local`
--

LOCK TABLES `dim_local` WRITE;
/*!40000 ALTER TABLE `dim_local` DISABLE KEYS */;
INSERT INTO `dim_local` VALUES (107,'','','','Brasil',''),(108,'','','Rio de Janeiro','Brasil',''),(109,'','Rio de Janeiro','Rio de Janeiro','Brasil',''),(110,'Estadio Jornalista Mário Filho (Maracanã)','Rio de Janeiro','Rio de Janeiro','Brasil','https://media.api-sports.io/football/venues/204.png'),(111,'','','Minas Gerais','Brasil',''),(112,'','Belo Horizonte','Minas Gerais','Brasil',''),(113,'Estádio Raimundo Sampaio','Belo Horizonte','Minas Gerais','Brasil','https://media.api-sports.io/football/venues/206.png'),(114,'','','Goiás','Brasil',''),(115,'','Goiânia','Goiás','Brasil',''),(116,'Estádio Antônio Accioly','Goiânia','Goiás','Brasil','https://media.api-sports.io/football/venues/211.png'),(117,'','','Santa Catarina','Brasil',''),(118,'','Florianópolis','Santa Catarina','Brasil',''),(119,'Estádio Aderbal Ramos da Silva','Florianópolis','Santa Catarina','Brasil','https://media.api-sports.io/football/venues/214.png'),(120,'','','Bahia','Brasil',''),(121,'','Salvador','Bahia','Brasil',''),(122,'Arena Fonte Nova','Salvador','Bahia','Brasil','https://media.api-sports.io/football/venues/216.png'),(123,'Estádio Nilton Santos','Rio de Janeiro','Rio de Janeiro','Brasil','https://media.api-sports.io/football/venues/218.png'),(124,'','','São Paulo','Brasil',''),(125,'','Bragança Paulista','São Paulo','Brasil',''),(126,'Estádio Nabi Abi Chedid','Bragança Paulista','São Paulo','Brasil','https://media.api-sports.io/football/venues/220.png'),(127,'','','Ceará','Brasil',''),(128,'','Fortaleza','Ceará','Brasil',''),(129,'Estádio Governador Plácido Aderaldo Castelo','Fortaleza','Ceará','Brasil','https://media.api-sports.io/football/venues/225.png'),(130,'','Chapecó','Santa Catarina','Brasil',''),(131,'Arena Condá','Chapecó','Santa Catarina','Brasil','https://media.api-sports.io/football/venues/227.png'),(132,'','','Paraná','Brasil',''),(133,'','Curitiba','Paraná','Brasil',''),(134,'Estádio Major Antônio Couto Pereira','Curitiba','Paraná','Brasil','https://media.api-sports.io/football/venues/230.png'),(135,'Estádio Governador Magalhães Pinto','Belo Horizonte','Minas Gerais','Brasil','https://media.api-sports.io/football/venues/234.png'),(136,'','','Mato Grosso','Brasil',''),(137,'','Cuiabá','Mato Grosso','Brasil',''),(138,'Arena Pantanal','Cuiabá','Mato Grosso','Brasil','https://media.api-sports.io/football/venues/235.png'),(139,'Estádio de Hailé Pinheiro','Goiânia','Goiás','Brasil','https://media.api-sports.io/football/venues/240.png'),(140,'','','Rio Grande do Sul','Brasil',''),(141,'','Porto Alegre','Rio Grande do Sul','Brasil',''),(142,'Arena do Grêmio','Porto Alegre','Rio Grande do Sul','Brasil','https://media.api-sports.io/football/venues/241.png'),(143,'Estádio José Pinheiro Borda','Porto Alegre','Rio Grande do Sul','Brasil','https://media.api-sports.io/football/venues/244.png'),(144,'','Caxias do Sul','Rio Grande do Sul','Brasil',''),(145,'Estádio Alfredo Jaconi','Caxias do Sul','Rio Grande do Sul','Brasil','https://media.api-sports.io/football/venues/248.png'),(146,'','','Pernambuco','Brasil',''),(147,'','Recife','Pernambuco','Brasil',''),(148,'Itaipava Arena Pernambuco','Recife','Pernambuco','Brasil','https://media.api-sports.io/football/venues/253.png'),(149,'','São Paulo','São Paulo','Brasil',''),(150,'Allianz Parque','São Paulo','São Paulo','Brasil','https://media.api-sports.io/football/venues/258.png'),(151,'Estádio Cícero Pompeu de Toledo (Morumbi)','São Paulo','São Paulo','Brasil','https://media.api-sports.io/football/venues/269.png'),(152,'Arena da Baixada','Curitiba','Paraná','Brasil','https://media.api-sports.io/football/venues/10493.png'),(153,'','Santos','São Paulo','Brasil',''),(154,'Estádio Urbano Caldeira','Santos','São Paulo','Brasil','https://media.api-sports.io/football/venues/10494.png'),(155,'Neo Química Arena','São Paulo','São Paulo','Brasil','https://media.api-sports.io/football/venues/11531.png'),(156,'Estádio São Januário','Rio de Janeiro','Rio de Janeiro','Brasil','https://media.api-sports.io/football/venues/19377.png'),(157,'Arena MRV','Belo Horizonte','Minas Gerais','Brasil','https://media.api-sports.io/football/venues/21427.png'),(158,'Estádio Municipal Presidente Getúlio Vargas','Fortaleza','Ceará','Brasil','https://media.api-sports.io/football/venues/237.png'),(159,'Estádio Durival de Britto e Silva','Curitiba','Paraná','Brasil','https://media.api-sports.io/football/venues/259.png'),(160,'','Uberlândia','Minas Gerais','Brasil',''),(161,'Estádio Municipal João Havelange','Uberlândia','Minas Gerais','Brasil','https://media.api-sports.io/football/venues/278.png'),(162,'','Volta Redonda','Rio de Janeiro','Brasil',''),(163,'Estádio Municipal General Raulino de Oliveira','Volta Redonda','Rio de Janeiro','Brasil','https://media.api-sports.io/football/venues/5650.png'),(164,'Estádio Luso-Brasileiro','Rio de Janeiro','Rio de Janeiro','Brasil','https://media.api-sports.io/football/venues/5665.png'),(165,'','Sete Lagoas','Minas Gerais','Brasil',''),(166,'Arena do Jacaré','Sete Lagoas','Minas Gerais','Brasil','https://media.api-sports.io/football/venues/8267.png'),(167,'Estádio Governador Roberto Santos','Salvador','Bahia','Brasil','https://media.api-sports.io/football/venues/11287.png'),(168,'','','Espírito Santo','Brasil',''),(169,'','Cariacica','Espírito Santo','Brasil',''),(170,'Estádio Kleber José de Andrade','Cariacica','Espírito Santo','Brasil','https://media.api-sports.io/football/venues/20691.png');
/*!40000 ALTER TABLE `dim_local` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-04 13:45:32
