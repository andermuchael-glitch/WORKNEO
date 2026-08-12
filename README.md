# Fila de Produção (PWA)

Painel de produção — Pré-Corte → Corte → Sublimação → Aguardando Costura → Costura → Separação —
pronto para instalar como app (PWA) e publicar de graça no GitHub Pages.

## ⚠️ Sobre os dados (leia antes de usar com a equipe)

Este app foi extraído de um artifact do Claude, que usava um armazenamento compartilhado
próprio da Anthropic. Fora desse ambiente, o app usa `localStorage` do navegador — ou seja,
**os dados ficam salvos só no aparelho/navegador de quem está usando**, não são
compartilhados automaticamente entre a equipe.

Isso funciona bem se:
- só uma pessoa/um computador lança e acompanha a fila; ou
- cada estação (corte, sublimação, costura) usa sempre o mesmo tablet/computador dedicado.

Se vocês precisam que **todo mundo veja os mesmos dados em tempo real** (por exemplo, alguém
lança um pedido no celular e a pessoa da sublimação já vê no computador da fábrica), é
necessário um backend compartilhado — o mais simples de configurar de graça é o
[Firebase Firestore](https://firebase.google.com/docs/firestore) ou o
[Supabase](https://supabase.com/). Se quiser, posso te ajudar a adaptar o arquivo
`src/App.jsx` pra usar um desses serviços no lugar do `localStorage` — é só pedir.

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior instalado no seu computador.
- Uma conta no [GitHub](https://github.com).
- [Git](https://git-scm.com/) instalado.

## 2. Rodar localmente (pra testar antes de publicar)

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (algo como `http://localhost:5173`).

## 3. Publicar no GitHub Pages

### Passo a passo

1. **Crie um repositório novo no GitHub** (pode ser público), por exemplo `fila-producao`.

2. **Ajuste o `base` no `vite.config.js`** para bater com o nome do repositório:
   ```js
   base: "/fila-producao/", // troque "fila-producao" pelo nome real do seu repositório
   ```
   Se o repositório se chamar `SEUUSUARIO.github.io` (repositório de usuário), use `base: "/"`.

3. **Envie o código pro GitHub**, na branch `main`:
   ```bash
   git init
   git add .
   git commit -m "primeira versão do painel de produção"
   git branch -M main
   git remote add origin https://github.com/SEUUSUARIO/fila-producao.git
   git push -u origin main
   ```

4. **Ative o GitHub Pages via Actions**:
   - No GitHub, vá em **Settings → Pages** do repositório.
   - Em "Build and deployment", escolha **Source: GitHub Actions**.

5. Pronto. O workflow em `.github/workflows/deploy.yml` já está configurado: toda vez que
   você der `git push` na branch `main`, o site é gerado e publicado automaticamente em
   alguns minutos, em:
   ```
   https://SEUUSUARIO.github.io/fila-producao/
   ```

Você pode acompanhar o progresso do deploy na aba **Actions** do repositório.

## 4. Instalar como app (PWA)

Depois de publicado, abra o link no celular ou computador:

- **Android/Chrome**: menu (⋮) → "Adicionar à tela inicial" ou "Instalar app".
- **iPhone/Safari**: botão de compartilhar → "Adicionar à Tela de Início".
- **Computador (Chrome/Edge)**: ícone de instalação (⊕) que aparece na barra de endereço.

O app funciona offline para a interface (graças ao service worker gerado pelo
`vite-plugin-pwa`), mas os dados salvos continuam sujeitos à limitação de armazenamento
local descrita acima.

## 5. Estrutura do projeto

```
├── src/
│   ├── App.jsx        ← toda a lógica e telas do painel
│   ├── main.jsx        ← ponto de entrada React
│   └── index.css
├── public/
│   ├── icon-192.png     ← ícones do app (troque pelos seus se quiser)
│   ├── icon-512.png
│   └── favicon.svg
├── vite.config.js       ← configuração do build + PWA (ajuste o "base" aqui)
├── package.json
└── .github/workflows/deploy.yml   ← publica automaticamente a cada push na main
```

## 6. Trocar os ícones

Troque os arquivos `public/icon-192.png` e `public/icon-512.png` por imagens quadradas
suas (mesmo tamanho: 192×192 e 512×512 pixels) e faça um novo `git push`.
