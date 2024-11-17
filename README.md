# Sobre o projeto

Projeto da empresa Kejinho para encomendas, o app funciona tanto para usuários quanto para colaboradores da empresa tendo uma tela administrativa e uma tela de usuários.

## 📱 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Axios](https://axios-http.com/)
- [MySQL](https://www.mysql.com/)

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js
- Yarn ou npm
- Expo CLI
- Configuração do `.env`:

  Crie um arquivo `.env` na raiz do projeto e configure as variáveis necessárias:

  ```env
  API_URL=http://caminho-da-api
  PHONE_NUMBER=+5599999999
  DB_HOST=host do banco de dados
  DB_PORT=porta do banco de dados
  DB_USER=usuário do banco de dados
  DB_NAME=nome do banco de dados
  DB_PASSWORD=senha do banco de dados

- Clone o repositório:
- git clone <https://github.com/douglasbks/kejinho>
- cd <kejinho>
- Instale as dependências:
- yarn install
- ou
- npm install
- Inicie o servidor de desenvolvimento:
- expo start
## 🗂️ Estrutura do Projeto
assets/                  # Imagens usadas no app

backend/                 # Backend do aplicativo (API e conexão com o banco)
├── index.js             # Conexão com o banco de dados e APIs do app

src/                     # Código fonte do app
├── navigation/          # Definição das rotas para as telas do app
├── screens/             # Telas principais do aplicativo

└── App.js               # Componente principal do app

## 🛠️ Funcionalidades
Usuário:
- Fazer Encomendas.
- Ver histórico e status de encomendas.
- Entrar em contato com a empresa.

Admin:
- Verificar encomendas e mudar o status delas.
- Alterar e Adicionar Produtos.
- Alterar dias de entrega disponíveis.

## 📜 Licença
Este projeto está sob a licença MIT.