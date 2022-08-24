//importando classe(dentro de models) que valida os dados
const Login = require('../models/LoginModel');

exports.index = (req, res) => {
  if(req.session.user) res.render('login-logado');
  return res.render('login');
}


exports.register = async function(req, res) {
  try {
    //criando instância de 'register' enviando o body
    const login = new Login(req.body);
    await login.register();
  
    //exibindo as mensagens de erro no formulário(view) caso exista
    if(login.errors.length > 0) {
      //salva o array de mensagens no flash messages com a tag 'errors'
      req.flash('errors', login.errors);
       //volta a página de cadastro e exibe os erros, salvando a sessão
      req.session.save(function () {
        return res.redirect('/login/index');
      });
      return;
    }
  
    req.flash('success', 'Seu usuário foi criado com sucesso.');
    //volta a página de cadastro e exibe os erros, salvando a sessão
    req.session.save(function () {
       return res.redirect('/login/index');
    });
  } catch(e){
    console.log(e);
    return res.render('404');
  }
};

exports.login = async function(req, res) {
  try {
    //criando instância de 'Signup' enviando o body
    const login = new Login(req.body);
    // chama método que chama a validação dos dados
    await login.login();
    //exibindo as mensagens de erro no formulário(view) caso exista
    if(login.errors.length > 0) {
       //salva o array de mensagens no flash messages com a tag 'errors'
      req.flash('errors', login.errors);
      //volta a página de cadastro e exibe os erros, salvando a sessão
      req.session.save(function () {
        return res.redirect('/login/index');
      });
      return;
    }
  
    req.flash('success', 'Login efetuado com sucesso.');
    // salvar o usuário logado na sessão session
    req.session.user = login.user;
    //volta a página de cadastro e exibe os erros, salvando a sessão
    req.session.save(function () {
       return res.redirect('/login/index');
    });
  } catch(e){
    console.log(e);
    return res.render('404');
  }
};

exports.logout = function(req, res) {
  req.session.destroy();
  res.redirect('/login/index');
};
