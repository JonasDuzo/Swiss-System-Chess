// const express = require('express');
// const { engine } = require('express-handlebars');
// const bodyParser = require('body-parser');
// const methodOverride = require('method-override');
// const session = require('express-session');
// const flash = require('connect-flash');
// const path = require('path');

// // Importando rotas
// const indexRoutes = require('./routes/index');
// const playerRoutes = require('./routes/players');
// const tournamentRoutes = require('./routes/tournaments');

// const app = express();

// // Configurações
// app.engine('handlebars', engine({
//     defaultLayout: 'main',
//     layoutsDir: path.join(__dirname, 'views/layouts')
// }));
// app.set('view engine', 'handlebars');
// app.set('views', path.join(__dirname, 'views'));

// // Middlewares
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(methodOverride('_method'));
// app.use(session({
//     secret: 'chess-tournament-secret',
//     resave: true,
//     saveUninitialized: true
// }));
// app.use(flash());

// // Variáveis globais
// app.use((req, res, next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     next();
// });

// // Rotas
// app.use('/', indexRoutes);
// app.use('/players', playerRoutes);
// app.use('/tournaments', tournamentRoutes);

// // Iniciar servidor
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Servidor rodando na porta ${PORT}`);
// });

const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

// Importando rotas
const indexRoutes = require('./routes/index');
const playerRoutes = require('./routes/players');
const tournamentRoutes = require('./routes/tournaments');

const app = express();

// Configurações
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: (a, b) => a === b
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'chess-tournament-secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Variáveis globais
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Rotas
app.use('/', indexRoutes);
app.use('/players', playerRoutes);
app.use('/tournaments', tournamentRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
