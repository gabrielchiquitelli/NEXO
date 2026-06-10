# Firebase da área do cliente Nexo

Este site usa:

- Firebase Authentication com Google;
- Firebase Authentication com Email/Senha;
- Cloud Firestore para salvar o perfil em `usuarios/{uid}`.

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

Essas regras deixam cada usuário ler e editar apenas o próprio perfil em `usuarios/{uid}`.

## 5. Testar localmente

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
9. No Firebase, vá em **Firestore Database** > **Dados** e veja a coleção `usuarios`.

## Erros comuns

- `auth/operation-not-allowed`: Google ou Email/Senha ainda não foi ativado em **Authentication** > **Método de login**.
- `auth/unauthorized-domain`: o domínio usado para abrir o site não está em **Authentication** > **Configurações** > **Domínios autorizados**.
- `permission-denied`: as regras do **Cloud Firestore** não foram publicadas ou você publicou as regras na tela errada.
- Abrir com duplo clique no HTML pode falhar. Use `http://127.0.0.1:8123/...`.
