# Firebase da área do cliente Nexo

Este site usa:

- Firebase Authentication com Google;
- Firebase Authentication com Email/Senha;
- Cloud Firestore para salvar perfil, pedidos e chat.

Não precisa ativar **Storage** nem mudar para Blaze. A foto do perfil é reduzida no navegador e salva pequena dentro do documento do usuário no Firestore.

Coleções usadas:

- `usuarios/{uid}`: perfil, desconto e cargo do usuário;
- `pedidos/{pedidoId}`: briefings enviados pelo site;
- `parcerias/{parceriaId}`: indicações, parceiros e candidatos para ajudar em projetos;
- `conversas/{uid}/mensagens/{messageId}`: chat entre cliente e admin.

## 1. Ativar os métodos de login

1. Abra o projeto **Nexo Digital** no Firebase.
2. No menu esquerdo, clique em **Authentication**.
3. Entre na aba **Método de login**.
4. Ative **Google**.
5. Ative **Email/Senha**.
6. Clique em **Salvar** em cada provedor.

Se não achar: use a busca no topo do Firebase e pesquise `Authentication`.

## 2. Conferir domínios autorizados

1. Ainda em **Authentication**, entre na aba **Configurações**.
2. Na lateral interna, clique em **Domínios autorizados**.
3. Deixe estes domínios cadastrados:

- `localhost`
- `127.0.0.1`
- `nexo-digital-9e762.firebaseapp.com`
- `nexo-digital-9e762.web.app`

Quando publicar em um domínio próprio, adicione também o domínio real do site.

## 3. Criar o Cloud Firestore

Importante: não é **Realtime Database**. Este site usa **Cloud Firestore**.

1. No menu esquerdo, procure **Firestore Database**.
2. Se não aparecer nos atalhos, abra **Categorias dos produtos** > **Bancos de dados e armazenamento** > **Firestore Database**.
3. Clique em **Criar banco de dados** se ainda não criou.
4. Pode escolher modo de produção.
5. Escolha a localização do banco e confirme.

Se estiver perdido, use a busca no topo do Firebase e digite `Firestore Database`.

## 4. Publicar as regras certas

1. Entre em **Firestore Database**.
2. Clique na aba **Regras**.
3. Apague o conteúdo atual.
4. Cole o conteúdo do arquivo `firestore.rules`.
5. Clique em **Publicar**.

Essas regras deixam cada cliente acessar apenas o próprio perfil, pedidos, parcerias e chat. A conta com `cargo` igual a `admin` consegue ver pedidos, comissões de indicação, parcerias, candidatos, chats, alterar status e excluir registros.

## 5. Definir sua conta como admin

Depois de criar sua conta pelo site:

1. No Firebase, entre em **Firestore Database**.
2. Abra a aba **Dados**.
3. Clique na coleção `usuarios`.
4. Abra o documento com o seu usuário.
5. Adicione ou edite o campo:

```text
cargo: admin
```

O tipo do campo pode ser **string/texto**.

Quando você entrar em `dashboard.html`, a aba **Admin** vai aparecer.

## 6. Testar localmente

No terminal, dentro da pasta do site:

```powershell
python -m http.server 8123
```

Depois abra:

```text
http://127.0.0.1:8123/registrar.html
```

Teste assim:

1. Crie uma conta com **Google** ou com **e-mail e senha**.
2. O site deve abrir `dashboard.html?tab=profile`.
3. Complete os campos do perfil.
4. Escolha uma foto em JPG, PNG ou WEBP.
5. Clique em **Salvar perfil**.
6. O site deve voltar para a página inicial.
7. A área da conta deve mostrar o desconto de **20% na primeira compra**.
8. Volte para `index.html`.
9. No canto do menu, o ícone de login deve virar a foto ou iniciais da pessoa.
10. Clique na foto e confira o menu: **Ver perfil**, **Compras feitas**, **Minha área** e **Sair da conta**.
11. Abra **dashboard.html?tab=referrals** e copie o link de indicação.
12. Crie outra conta usando `registrar.html?ref=CODIGO`.
13. Volte para a página inicial e faça o diagnóstico de plano.
14. Clique em **Completar briefing** e envie o formulário.
15. O pedido deve aparecer em **dashboard.html?tab=purchases**.
16. Na sua conta admin, abra a aba **Admin** para ver pedidos, comissões, parcerias e chats.
17. No Firebase, vá em **Firestore Database** > **Dados** e confira `usuarios`, `pedidos`, `parcerias` e `conversas`.

## Erros comuns

- `auth/operation-not-allowed`: Google ou Email/Senha ainda não foi ativado em **Authentication** > **Método de login**.
- `auth/unauthorized-domain`: o domínio usado para abrir o site não está em **Authentication** > **Configurações** > **Domínios autorizados**.
- `permission-denied`: as regras do **Cloud Firestore** não foram publicadas ou você publicou as regras na tela errada.
- Se a foto não salvar, escolha uma imagem menor em JPG, PNG ou WEBP. O site reduz a imagem antes de salvar no Firestore.
- Abrir com duplo clique no HTML pode falhar. Use `http://127.0.0.1:8123/...`.
