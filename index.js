// npm init
// npm i express
// npm i mysql2
// npm i bcrypt
// node index.js -> executa a API
// ​http://localhost:3000/cliente
const express = require("express")
const app = express()
const port = 3000
app.use(express.json())

const db = require("./db")

const bcrypt = require("bcrypt")

app.post("/cliente", async (req, res) => {
    try {
        const cliente = req.body
        const senhaCript = bcrypt.hashSync(cliente.senha, 10)
        cliente.senha = senhaCript

       
        const resultado = await db.pool.query(
            `INSERT INTO cliente (
              nome, cpf, email, senha, celular
            ) VALUES ( ?, ?, ?, ?, ? )`,
            [cliente.nome, cliente.cpf,
             cliente.email, cliente.senha, cliente.celular]
        )
        res.status(201).json({
            mensagem: "Cliente cadastrado, ID = " + resultado[0].insertId
        })
    } catch (error) {
        res.status(500).json({erro: error.message})
    }
})


app.get("/cliente", async (req, res) => {
     try{
        const resultado = await db.pool.query(
            `SELECT nome, cpf, email, celular FROM cliente`
        )
        res.status(200).json(resultado[0])
    } catch(error){
        res.status(500).json({resposta: error.message})
    }  
})


app.get("/cliente/:id", async (req, res) => {
    try {
        const { id } = req.params

        const resultado = await db.pool.query(
            `SELECT id, nome, cpf, email, celular FROM cliente WHERE id = ?`,
            [id]
        )

        if (resultado[0].length === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        res.status(200).json(resultado[0][0])
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})


app.put("/cliente/:id", async (req, res) => {
    try {
        const { id } = req.params
        const cliente = req.body

        const existente = await db.pool.query(
            `SELECT id FROM cliente WHERE id = ?`,
            [id]
        )

        if (existente[0].length === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        let senha = cliente.senha
        if (senha) {
            senha = bcrypt.hashSync(senha, 10)
        }

        await db.pool.query(
            `UPDATE cliente SET
                nome = ?,
                cpf = ?,
                email = ?,
                senha = COALESCE(?, senha),
                celular = ?
             WHERE id = ?`,
            [
                cliente.nome,
                cliente.cpf,
                cliente.email,
                senha || null,
                cliente.celular,
                id
            ]
        )

        res.status(200).json({ mensagem: "Cliente atualizado" })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})


app.delete("/cliente/:id", async (req, res) => {
    try {
        const { id } = req.params

        const resultado = await db.pool.query(
            `DELETE FROM cliente WHERE id = ?`,
            [id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        res.status(200).json({ mensagem: "Cliente removido" })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

app.post("/login", async (req,res) => {
    try{
        const user = req.body
        const resultado = await db.pool.query(
            "SELECT email,  senha FROM cliente WHERE email = ?", [user.email]
        )
        const dados_bd = resultado[0][0]
        if(!dados_bd) {
            return res.status(401).json({msg: "email não encontrado!"})
        }
        if(user.senha != dados_bd) {
            return res.status(401).json({msg: "credenciais erradas!"})
        }
        return res.status(200).json({msg: "login realizado com sucesso"})

    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})
app.listen(port, () => {
    console.log("API rodando na porta " + port)
})

