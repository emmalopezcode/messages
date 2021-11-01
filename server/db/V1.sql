
CREATE TABLE `Person` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(30) DEFAULT NULL,
  `lastName` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(50) DEFAULT NULL,
  `whenRegistered` datetime NOT NULL,
  `termsAccepted` datetime DEFAULT NULL,
  `role` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

CREATE TABLE `Conversation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ownerId` int NOT NULL,
  `title` varchar(80) NOT NULL,
  `lastMessage` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_title` (`title`),
  KEY `FKMessage_ownerId` (`ownerId`),
  CONSTRAINT `FKMessage_ownerId` FOREIGN KEY (`ownerId`) REFERENCES `Person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

CREATE TABLE `Message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cnvId` int NOT NULL,
  `prsId` int NOT NULL,
  `content` varchar(5000) NOT NULL,
  `numLikes` int DEFAULT NULL,
  `whenMade` bigint DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKMessage_cnvId` (`cnvId`),
  KEY `FKMessage_prsId` (`prsId`),
  CONSTRAINT `FKMessage_cnvId` FOREIGN KEY (`cnvId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FKMessage_prsId` FOREIGN KEY (`prsId`) REFERENCES `Person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

CREATE TABLE `Like` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `msgId` int NOT NULL,
  `prsId` int NOT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKLike_msgId` (`msgId`),
  KEY `FKLike_prsId` (`prsId`),
  CONSTRAINT `FKLike_msgId` FOREIGN KEY (`msgId`) REFERENCES `Message` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FKLike_prsId` FOREIGN KEY (`prsId`) REFERENCES `Person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

insert into Person (firstName, lastName, email,       password,   whenRegistered, role)
            VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);