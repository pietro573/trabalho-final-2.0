const db = require("./db")


async function criar_tabelas(){

try{

 await db.pool.query(
    `
    DROP TABLE IF EXISTS cliente;
   
CREATE TABLE cliente (
   id int(11) NOT NULL AUTO_INCREMENT,
   nome varchar(100) NOT NULL,
   cpf char(14)NOT NULL,
   email varchar(200) NOT NULL,
   senha varchar(255) NOT NULL,
   celular char(11)NOT NULL,
   PRIMARY KEY (id),
   UNIQUE KEY email (email),
   UNIQUE KEY cpf (cpf)
 ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 INSERT INTO cliente VALUES 
 (1,'pietro','12540678900','fernando@gmail.com','$2b$10$h0orm8TCW/KjbiQvIVikd.qQ9KQ41aWQCecIQWIzNFiVajpKMnq0y','42569964444'),
 (2,'richard','12540678800','promarx@gmail.com','$2b$10$L.9mKpiIeFLaZk84ggmadetlHVhzr2v9yVSm8iL2xI/2B6EJlviGi','42569964444'),
 (3,'luizão','12520678800','ruivinho@gmail.com','$2b$10$2hQQ1rXPozehti4dzMKpU.xMQCMyvuD/48bxZ4vCKRRMM0AOKxiYq','42569964444');
 `)
console.log("estrutura de dados da tabela 'cliente' criado com sucesso!")
process.exit(0);
} 
catch (error){
    console.log(error)
}
}
criar_tabelas()
