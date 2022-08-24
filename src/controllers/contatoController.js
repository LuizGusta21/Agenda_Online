//importando o ContatoModel
const Contato = require('../models/ContatoModel');

exports.index = (req,res) => {
  // enviando um contato fake apenas para criação do objeto vazio
  if(req.session.user) return res.render('contato',{ contato: {}});
  return res.render('login'); 
}

/* NEW *** Como a criação do contato vem de uma função async,
ela retorna uma promise, portanto precisamos retorná-la como async await também
*/
exports.register = async(req, res) => {
  try {
    const contato = new Contato(req.body, req.session.user.email);
    // chama método que valida e cadastra usuário
    await contato.register();
    let idUser = null;
    
    //exibindo as mensagens de erro no formulário(view) caso exista
    if(contato.errors.length > 0) {
      //salva o array de mensagens no flash messages com a tag 'errors'
      req.flash('errors', contato.errors);
      //volta a página de cadastro e exibe os erros, salvando a sessão
      req.session.save(() => res.redirect('/contato/index'));
      return;
    }
  
    req.flash('success', 'Contato registrado com sucesso.');
    //volta a página de cadastro e exibe os erros, salvando a sessão
    idUser = contato.contato._id;
    req.session.save(() => res.redirect(`/contato/index/${contato.contato._id}`));
    return idUser;

  } catch(e) {
    console.log(e)
    return res.render('404');
  }

}

exports.editIndex = async (req, res) => {
  //se não existir o id do contato renderiza a página 404
  if(!req.params.id) return res.render('404');

  const contato = new Contato(req.body);

  // localiza os dados do contato pelo id
  const contatoSelect = await Contato.buscaId(req.params.id);
  // se não existir o id do contato renderiza a página 404
  if(!contato) return res.render('404');

  return res.render('contato', {contato : contatoSelect});
}

exports.edit = async (req,res) => {
  try{
    //se não existir o id do contato renderiza a página 404
    if(!req.params.id) return res.render('404');
     //cria a instância com o body coletado no post
    const contato = new Contato(req.body);
    // chama o método 'edit' do model que atualizará os dados
    await contato.edit(req.params.id);
  
    //exibindo as mensagens de erro no formulário(view) caso exista
    if(contato.errors.length > 0) {
      req.flash('errors', contato.errors);
      //salva o array de mensagens no flash messages com a tag 'errors'
      req.session.save(() => res.redirect('/contato/index'));
      return;
    }
  
    req.flash('success', 'Contato editado com sucesso.');
    //volta a página de cadastro, salvando a sessão
    req.session.save(() => res.redirect(`/contato/index/${contato.contato._id}`));
    return;  
  
  } catch(e) {
    console.log(e);
    res.render('404');
  }
}

exports.delete = async (req, res) => {
  //se não existir o id do contato renderiza a página 404
  if(!req.params.id) return res.render('404');

  const contato = new Contato(req.body);

  // exlcua contato pelo id
  const contatoSelect = await Contato.delete(req.params.id);
   // se naõ existir o id do contato renderiza a página 404
  if(!contatoSelect) return res.render('404');

  //volta a página index, salvando a sessão
  req.flash('success', 'Contato excluido com sucesso.');
  req.session.save(() => res.redirect('/'));
  return;
}

