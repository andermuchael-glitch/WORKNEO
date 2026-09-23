# WORKNEO · Login e sincronização na nuvem

A implementação usa Supabase Auth + PostgreSQL. O navegador e o APK Android usam a mesma conta e os mesmos dados.

## 1. Criar o projeto Supabase
Crie um projeto no Supabase e, no SQL Editor, execute:
`supabase/workneo_data.sql`

A tabela usa Row Level Security para que cada conta só consiga ler e alterar a própria linha. O aplicativo usa somente a chave pública/publishable key; nenhuma service-role key deve ser colocada no frontend.

## 2. Configurar o projeto
Crie as variáveis de build:

`VITE_SUPABASE_URL` = URL do projeto Supabase  
`VITE_SUPABASE_PUBLISHABLE_KEY` = chave publishable/anon do projeto

Para desenvolvimento local, coloque-as em `.env.local`.

Para GitHub Actions, cadastre-as como Secrets/Variables do repositório e passe-as para o passo `npm run build`.

## 3. Primeiro acesso
Com a integração configurada, o WORKNEO mostra a tela de login.

- **Criar conta** cria uma conta por e-mail e senha.
- **Entrar** usa a mesma conta no PC e Android.
- **Esqueci a senha** envia o fluxo de recuperação por e-mail.
- A sessão fica persistida.

Na primeira entrada, se a conta ainda não possuir dados na nuvem, o WORKNEO envia os dados locais existentes para a nuvem. Se a conta já tiver dados, a nuvem é carregada como fonte principal e o cache local é atualizado.

## 4. Backup JSON
Os botões `⬇ BACKUP` e `⬆ RESTAURAR` continuam funcionando. O backup JSON é independente da nuvem e permanece compatível com a estrutura atual do WORKNEO.

## 5. Sincronização
Cada alteração salva no WORKNEO é enviada automaticamente para a nuvem. O outro dispositivo recebe alterações pelo Supabase Realtime e atualiza as listas/relatórios sem precisar importar JSON.

A chave publishable/anon pode ficar no frontend quando as tabelas estão protegidas por RLS; nunca coloque a service-role/secret key no aplicativo.
