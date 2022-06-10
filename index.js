// ALUNO: LUCAS PEREIRA SANTANA
// RA: 3005739
// GUIA DE API UTILIZADA: https://db.ygoprodeck.com/api-guide/

// Iniciando as chamadas
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const i18n = require("i18n");
const porta = 8088;
const axios = require("axios");
const cors = require("cors");
const Sequelize = require("sequelize");
const Login = require("./login");
const Op = Sequelize.Op;
const session = require("express-session");
const Cards = require("./Cards");
//const req = require("express/lib/request");
//const database = require("./db");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Tentei salvar o login na sessão, 
// mas o projeto começou a dar tanto problema que não consegui implementar tudo
app.use(
  session({
    secret: "chavepw4",
    resave: true,
    saveUninitialized: true,
  })
);

// Chamada do Banco - Um para informações de Login e outro para dados de Cartas
(async () => {
  const database = require("./db");
  const Login = require("./login");
  const Cards = require("./Cards");
  await database.sync();
})();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);


app.post("/cadastrar", (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const nome = req.body.nome;

  if (res.status(200)) {
    (async () => {
      const novoUsuario = await Login.create({
        email: email,
        senha: senha,
        nome: nome,
      });
      res.json({ nome: nome, status: true });
    })();
  } else {
    if (err) console.log(err);
    else res.send(false);
  }
});

app.post("/cadastrarCard", (req, res) => {
  const nome = req.body.nome;
  const url_image = req.body.url_image;

  if (res.status(200)) {
    (async () => {
      const novaCarta = await Cards.create({
        nome: nome,
        url_image: url_image,
      });
      res.json({
        nome: nome,
        url_image: url_image,
        id: novaCarta.id,
        status: true,
      });
    })();
  } else {
    if (err) console.log(err);
    else res.send(false);
  }
});

app.post("/deletaCard", (req, res) => {
  const id = req.body.id;

  if (res.status(200)) {
    (async () => {
      const cartaDeletada = await Cards.destroy({
        where: {id: id}
      })
    })();
    (async () => {
      const cards = await Cards.findAll();
      if (cards.length === 0) {
        console.log(cards);
        res.send("Deu Ruim");
      } else {
        console.log('Entrou no ELSE')
        res.json(cards);
      }
      
    })();
  } else {
    if (err) console.log(err);
    else res.send(false);
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  if (res.status(200)) {
    (async () => {
      const usuario = await Login.findAll({
        where: {
          [Op.and]: [{ email: email }, { senha: senha }],
        },
      });
      if (usuario.length === 0) {
        console.log(usuario);
        res.send("Dados incorretos");
      } else {
        console.log(usuario);
        req.session.login = usuario;
        res.json({
          nome: usuario[0].nome,
          status: true,
          sessao: req.session.login,
        });
      }
    })();
  } else {
    if (err) console.log(err);
    else res.send("Email não encontrado!");
  }
});

app.get("/listarcards", (req, res) => {

  if (res.status(200)) {
    (async () => {
      const cards = await Cards.findAll();
      if (cards.length === 0) {
        console.log(cards);
        res.send("Deu Ruim");
      } else {
        console.log('Entrou no ELSE')
        res.json(cards);
      }
    })();
  } else {
    if (err) console.log(err);
    else res.send("Email não encontrado!");
  }
});

// Configurando Localidades
i18n.configure({
  locales: ["pt", "en"],
  directory: "./locales",
  defaultLocale: "pt",
});
app.use(i18n.init);

// Observar a porta que está rodando
app.listen(porta, () => {
  console.log(`Rodando na porta ${porta}`);
});

// Rota do tipo Get para "/" (padrão)
app.get("/", (req, res) => {
  //console.log(req.acceptsLanguages()) // Saber as linguagens aceitas
  //res.send(`${res.__('mensagem')} <img src="${urlImageHome}">`)
});

// Lista todas as cartas
// O ID das cartas podem ser usados como parâmetros para a rota abaixo
app.get("/allcards", (req, res) => {
  axios
    .get("https://db.ygoprodeck.com/api/v7/cardinfo.php")
    .then((response) => {
      const data = response.data.data;
      return res.json(data);
    });
});

// Procura cartas por ID
// ID de exemplo = 33244944
app.get("/allcards/:id", (req, res) => {
  axios
    .get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${req.params.id}`)
    .then((response) => {
      const data = response.data;
      console.log(data);
      return res.json(data);
    });
});

app.get("/vitrine", (req, res) => {
  axios
    .get(
      "https://db.ygoprodeck.com/api/v7/cardinfo.php?&startdate=01/01/2000&enddate=08/23/2002&dateregion=tcg_date"
    )
    .then((response) => {
      const data = response.data.data;
      var dataImage = data;
      var data2 = data.map(function (num) {
        return num.card_images[0].image_url;
      });
      //return res.json(data.data[0].card_images[0].image_url);
      return res.json(data2);
    });
});

// MOSTRA UMA CARTA RANDOMICA, ONDE TERÁ A IMAGEM DA CARTA CONTENDO AS INFORMAÇÕES DELA,
// O NOME DA CARTA E O ID, ONDE TAMBÉM PODE SER USADO PARA PESQUISAR NA ROTA  "/allcards/:id"
app.get("/randomcard", (req, res) => {
  axios
    .get("https://db.ygoprodeck.com/api/v7/randomcard.php")
    .then((response) => {
      const dataImage = response.data.card_images[0].image_url;
      const dataName = response.data.name;
      const dataId = response.data.id;
      const dataDesc = response.data.desc;
      //return res.send(`<h1>${dataName} - ID: ${dataId}<h1><img src="${dataImage}">`)
      return res.json({
        nome: dataName,
        id: dataId,
        img: dataImage,
        sessao: req.session,
      });
    });
});

// Lista todos os Archetypes (Arquétipos)
// Esses nomes podem ser usados como parâmetros para a rota abaixo
app.get("/archetypes", (req, res) => {
  axios
    .get("https://db.ygoprodeck.com/api/v7/archetypes.php")
    .then((response) => {
      const data = response.data;
      var data2 = data.map(function (num) {
        return num.archetype_name;
      });
      return res.json(data2);
    });
});

// Procura cartas por Archetypes
app.get("/archetypes/:name", (req, res) => {
  axios
    .get(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${req.params.name}`
    )
    .then((response) => {
      const data = response.data.data;
      //console.log(data.data)
      var dataName = data.map(function (num) {
        return num.name;
      });
      var dataImage = data.map(function (num) {
        return num.card_images[0].image_url;
      });

      return res.json({ image: dataImage });
      // return res.json({nome: dataName, imagem: dataImage})
    });
});

//requisição para loguin do usuario. Deve retornar um token em caso de posição
app.post("/autentica", (req, res) => {
  //tratar e enviar o token
  res.status(200).send("Autenticação");
  const id = 1;
  const senha = 1;
  if (id == senha) {
    var prk = fs.readFileSync("./private.key", "utf8");
    var token = jwt.sign({ id }, prk, {
      algorithm: "RS256",
    });

    return res.status(200).send({ autenticado: true, token: token });
  } else {
    return res.status(401).send({ autenticado: false, token: null });
  }
});
