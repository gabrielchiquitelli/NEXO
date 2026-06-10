# Firebase da área do cliente Nexo

Este site usa:

- Firebase Authentication com Google;
- Firebase Authentication com Email/Senha;
- Cloud Firestore para salvar perfil, pedidos e chat.

Coleções usadas:

- `usuarios/{uid}`: perfil, desconto e cargo do usuário;
- `pedidos/{pedidoId}`: briefings enviados pelo site;
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

Essas regras deixam cada cliente acessar apenas o próprio perfil, pedidos e chat. A conta com `cargo` igual a `admin` consegue ver todos os pedidos, responder chats e alterar status.

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
3. Complete o perfil e clique em **Salvar perfil**.
4. O site deve voltar para a aba **Início**.
5. A aba inicial deve mostrar o desconto de **20% na primeira compra**.
6. Volte para `index.html`.
7. No canto do menu, o ícone de login deve virar a foto ou iniciais da pessoa.
8. Clique na foto e confira o menu: **Ver perfil**, **Compras feitas**, **Minha área** e **Sair da conta**.
9. Volte para a página inicial e faça o diagnóstico de plano.
10. Clique em **Completar briefing** e envie o formulário.
11. O pedido deve aparecer em **dashboard.html?tab=purchases**.
12. Na sua conta admin, abra a aba **Admin** para ver pedidos e chats.
13. No Firebase, vá em **Firestore Database** > **Dados** e confira `usuarios`, `pedidos` e `conversas`.

## Erros comuns

- `auth/operation-not-allowed`: Google ou Email/Senha ainda não foi ativado em **Authentication** > **Método de login**.
- `auth/unauthorized-domain`: o domínio usado para abrir o site não está em **Authentication** > **Configurações** > **Domínios autorizados**.
- `permission-denied`: as regras do **Cloud Firestore** não foram publicadas ou você publicou as regras na tela errada.
- Abrir com duplo clique no HTML pode falhar. Use `http://127.0.0.1:8123/...`.
