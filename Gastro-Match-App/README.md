# GastroMatch Mobile

Aplicativo Expo / React Native integrado à API do GastroMatch.

## Fluxo do app

- A pessoa entra com o e-mail e a senha cadastrados no site.
- O cadastro acontece no site. O link da tela inicial do app abre o endereço configurado em `EXPO_PUBLIC_WEB_REGISTER_URL`.
- Depois de entrar, o app permite buscar e consultar receitas, ver ingredientes e modo de preparo, abrir videoaulas e gerenciar favoritos.
- A sessão é restaurada ao reabrir o app e o token fica salvo com `expo-secure-store`.

## Configuração

Crie um `.env` nesta pasta:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WEB_REGISTER_URL=http://localhost:5173
```

O padrão da API é `localhost` no iOS e web, e `10.0.2.2` no emulador Android. Para um aparelho físico, configure `EXPO_PUBLIC_API_URL` com o endereço IP local do computador que executa o backend, por exemplo `http://192.168.1.20:3000/api`. Configure `EXPO_PUBLIC_WEB_REGISTER_URL` com o endereço público do site ao publicar o app.

Instale as dependências e inicie o Expo:

```bash
npm install
npx expo start
```

O backend deve estar em execução e acessível pelo dispositivo. O cadastro precisa continuar habilitado no site para que novas contas possam ser criadas.
