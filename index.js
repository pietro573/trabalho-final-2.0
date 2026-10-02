// npm init
// npm i express
// npm i mysql2
// npm i bcrypt
// npm i jsonwebtoken
// npm i dotenv
// npm i cors
// node index.js -> executa a API
// ​http://localhost:3000/cliente
const express = require("express")
const app = express()
const port = 3000
app.use(express.json())

const db = require("./db")

const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")

const dotenv = require("dotenv")
dotenv.config()

const cors = require("cors")
app.use(cors())

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


app.get("/cliente/perfil", autenticar, async (req) => {
    try {
        const id = req.usuario.id

        const result = await db.pool.query(
            `SELECT * FROM cliente WHERE id = ?`, [id])
        const perfil = result[0][0]
        delete perfil.senha
            

        if (result[0].length === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        res.status(200).json(perfil)
    } catch (err) {
        res.status(500).json({ erro: "erro interno" });
        throw err;
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
        
        const  senha_valida = await bcrypt.compare(user.senha, dados_bd.senha)
        if (!senha_valida) {
            return res.status(401).json({msg: "credenciais inválidas!"})
        }
        const payload= {
            id: dados_bd.id,
            email: dados_bd.email
        }
        const token = jwt. sign(payload, process.env.JWT_SECRET, {expiresI: '1m'})
        return res.status(200). json({nome: dados_bd.nome, token: token})
        

    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})
app.listen(port, () => {
    console.log("API rodando na porta " + port)
})

function autenticar(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null){
        return res.status(401).json({erro: "Token não enviado, usar Authorization Bearer <token>"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({erro: "Token inválido"})
        req.usuario = usuario
        next()
    })   
}
