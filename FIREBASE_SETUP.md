# Firebase da área do cliente Nexo

Este site usa:

- Firebase Authentication com Google;
- Firebase Authentication com Email/Senha;
- Firebase Authentication com Telefone para confirmar WhatsApp por SMS;
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
6. Ative **Telefone**.
7. Clique em **Salvar** em cada provedor.

Se não achar: use a busca no topo do Firebase e pesquise `Authentication`.

Para o SMS funcionar no Brasil:

1. Em **Authentication**, entre na aba **Configurações**.
2. Procure **Política de região de SMS**.
3. Libere o Brasil, ou deixe a política permitir o país onde seus clientes vão estar.

Observação: a confirmação de **e-mail** do Firebase chega como um link oficial no e-mail. A confirmação de **telefone** chega como código por SMS.

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

Essas regras deixam cada cliente acessar apenas o próprio perfil, pedidos, parcerias e chat. Elas também bloqueiam pedido, parceria e perfil completo quando a conta não tem e-mail ou telefone confirmado. A conta com `cargo` igual a `admin` consegue ver pedidos, comissões de indicação, parcerias, candidatos, chats e alterar status.

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
4. Confirme o **e-mail** ou o **telefone**.
5. Para telefone, digite o WhatsApp, clique em **Enviar código**, receba o SMS e confirme.
6. Escolha uma foto em JPG, PNG ou WEBP.
7. Clique em **Salvar perfil**.
8. O site deve voltar para a aba **Início**.
9. A aba inicial deve mostrar o desconto de **20% na primeira compra**.
10. Volte para `index.html`.
11. No canto do menu, o ícone de login deve virar a foto ou iniciais da pessoa.
12. Clique na foto e confira o menu: **Ver perfil**, **Compras feitas**, **Minha área** e **Sair da conta**.
13. Abra **dashboard.html?tab=referrals** e copie o link de indicação.
14. Crie outra conta usando `registrar.html?ref=CODIGO`.
15. Volte para a página inicial e faça o diagnóstico de plano.
16. Clique em **Completar briefing** e envie o formulário.
17. O pedido deve aparecer em **dashboard.html?tab=purchases**.
18. Na sua conta admin, abra a aba **Admin** para ver pedidos, comissões, parcerias e chats.
19. No Firebase, vá em **Firestore Database** > **Dados** e confira `usuarios`, `pedidos`, `parcerias` e `conversas`.

## Erros comuns

- `auth/operation-not-allowed`: Google, Email/Senha ou Telefone ainda não foi ativado em **Authentication** > **Método de login**.
- `auth/invalid-phone-number`: digite o telefone com DDD. Exemplo: `(16) 99999-9999`.
- `auth/captcha-check-failed`: o reCAPTCHA do telefone falhou. Confira domínio autorizado e tente de novo.
- `auth/unauthorized-domain`: o domínio usado para abrir o site não está em **Authentication** > **Configurações** > **Domínios autorizados**.
- `permission-denied`: as regras do **Cloud Firestore** não foram publicadas ou você publicou as regras na tela errada.
- Se a foto não salvar, escolha uma imagem menor em JPG, PNG ou WEBP. O site reduz a imagem antes de salvar no Firestore.
- Abrir com duplo clique no HTML pode falhar. Use `http://127.0.0.1:8123/...`.
