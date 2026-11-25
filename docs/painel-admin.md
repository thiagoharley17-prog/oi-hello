# Painel administrativo (`/admin`) — Acesso, TOTP e Retenção

## 1. Como convidar o Dr. Hausner e autorizar somente o UUID dele

O painel `/admin` não possui cadastro público (e o cadastro público de contas foi desabilitado na autenticação do projeto). Nenhum e-mail, senha ou UUID inicial fica no código.

1. No editor do Lovable, abra **Cloud → Users** (painel autenticado do projeto).
2. Crie ou convide a conta do Dr. Hausner usando o e-mail profissional dele (**Invite user** ou **Add user** com e-mail e senha inicial segura).
3. Na lista de usuários, copie o **UUID** exato gerado para a conta dele (ex.: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
4. Abra **Cloud → Database → Tables → `admin_users`** e insira uma nova linha:
   - `user_id`: cole **somente** o UUID copiado do Dr. Hausner.
   - `label`: opcional (ex.: `Dr. Hausner`).
5. Salve a linha. Somente contas cujo UUID esteja em `public.admin_users` conseguem avançar para o cadastro de TOTP e acessar métricas.

## 2. Primeiro acesso com Google Authenticator (TOTP)

1. Se a conta foi convidada por e-mail, o Dr. Hausner clica no link do convite, é direcionado a `/admin` e define sua senha (mínimo 10 caracteres). Se foi criada com senha, basta abrir `/admin` e entrar com e-mail e senha.
2. Ainda no estado inicial (AAL1), o servidor verifica se o UUID está em `public.admin_users`. Contas não autorizadas são desconectadas imediatamente, sem exibir o QR Code.
3. Para conta autorizada sem fator TOTP verificado, o painel exibe o **QR Code** (e a chave manual) para cadastro no **Google Authenticator** (ou outro app TOTP compatível).
4. O Dr. Hausner escaneia o QR Code e informa o primeiro código de 6 dígitos para validar e elevar a sessão para **AAL2**.
5. Nas próximas sessões, após e-mail e senha, o painel exige sempre o desafio de 6 dígitos do Google Authenticator antes de liberar qualquer dado.

## 3. Política de privacidade e retenção

- A telemetria registra apenas um ID de sessão aleatório opaco (UUID v4), rotas públicas sem query/hash, etapas do funil, cliques diretos em WhatsApp e horário do último heartbeat.
- Nunca são armazenados nome, telefone, e-mail, corpo de formulário, IP bruto, URLs com parâmetros ou fingerprint.
- **Retenção:** sessões sem atividade há mais de **30 dias** são removidas automaticamente (junto com seus eventos via `ON DELETE CASCADE`) durante leituras autenticadas do painel e de forma oportunista na ingestão.
- **Presença em tempo real:** exibida explicitamente como estimativa de sessões únicas com aba pública visível e heartbeat nos últimos **60 segundos** (envio a cada 25 s, deduplicado entre abas do mesmo navegador; abas ocultas param de enviar e `/admin` nunca é contado).
## 4. Demonstração e implantação de teste na Vercel

- `/admin/demo` exibe o painel com dados fictícios e permite testar períodos, filtros e paginação sem conta.
- `/admin` é o acesso privado, que exige a conta autorizada e o segundo fator descritos acima.
- Na Vercel, implante o commit que inclui as duas rotas. Use `npm run build` e deixe a opção de diretório de saída sem override: o Nitro gera `.vercel/output` com a função de servidor. Para reproduzir o empacotamento localmente, rode `VERCEL=1 npm run build`.
- Para as funções reais na Vercel, configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SERVICE_ROLE_KEY` como variáveis do servidor, e as variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para o cliente. A chave `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no servidor. A demonstração não precisa dessas credenciais.
