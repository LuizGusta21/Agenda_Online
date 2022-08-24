// criando model para a rota '/'
// iniciando mongoose
const mongoose = require('mongoose');
// NEW *** importando validator
const validator = require('validator');
// NEW *** importando bcrypt
const bcryptjs = require('bcryptjs');
// criando schema(dados e regras para os dados)
const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true},
  nome: {type: String, required:false},
  password: { type: String, required: true}
},
  {collection: 'users'}
);

// criando o model
const LoginModel = mongoose.model('Login', LoginSchema);

// tratando os dados
class Login{
  constructor(body) {
    this.body = body;
    //flag de erros
    this.errors = [];
    //salva sessão
    this.user = null;
  }

  // TODA OPERAÇÃO DE BD TRABALHAMOS COM PROMISE(ASYNC E AWAIT)
  // criando método para login do usuário
  async login() {
    // chama método que limpa e valida os dados
    this.valida();
    // checa se há erros e não permite a gravação dos dados no bd
    if (this.errors.length > 0) return;
    // localiza o usuário no bd e o salva na chave 'user'
    this.user = await LoginModel.findOne({email: this.body.email});
    // se usuário não existir, adiciona erro
    if(!this.user) {
      this.errors.push('Usuário não existe.');
      return;
    }

    // validar a senha decriptando e comparando com a senha armazenada no bd
    if(!bcryptjs.compareSync(this.body.password, this.user.password)) {
      this.errors.push('Usuário ou senha está incorreto.');
      this.user = null;
      return;
    }

  }

  async register() {
    // chama método que limpa e valida os dados
    this.valida();
    if (this.errors.length > 0) return;

    // checa se usuário existe
    await this.userExists();
    // checa se há erros e não permite a gravação dos dados no bd
    if (this.errors.length > 0) return;
    
    // NEW *** adicionando hash a senha =>
    // criando salt
    const salt = bcryptjs.genSaltSync();
    // adicionando salt à senha;
    this.body.password = bcryptjs.hashSync(this.body.password, salt);
    
    //armazenando os dados => chama o model passando o body já validado
    this.user = LoginModel.create(this.body);
    
  }
  
  async userExists() {
    // verifica se existe um email de mesmo valor que a key do body
    const user = await LoginModel.findOne({email: this.body.email});
    if(user) this.errors.push('Usuário já existe.');
  }

  valida() {
    // chama método que percorre cada chave e valida se todos os valores são strings
    this.cleanUp();

    // E-mail precisa ser preenchido e válido
    if(!validator.isEmail(this.body.email)) this.errors.push('E-mail inválido!');
    
    // Nome precisa ser preenchido
    //if (!this.body.nome) this.errors.push('Nome precisa ser preenchido');

    // senha precisa ter entre 6 e 20 caracteres
    if(this.body.password.length < 3 || this.body.password.length > 20) {
       this.errors.push('Senha tem que ter entre 3 e 20 caracteres.');
      }
  }

  cleanUp() {
    // método que percorre cada chave e valida se todos os valores são strings
    for(const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    // garantir que tenhamos somente os campos necessários para validação do model(excluindo outros dados como csrf token)
    this.body = {
      email: this.body.email,
      nome: this.body.nome,
      password: this.body.password
    };
  }
};

// exportando o model
module.exports = Login;