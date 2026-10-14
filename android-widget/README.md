# WORKNEO · Widget de lançamento rápido para Android

Este é um aplicativo auxiliar Android que instala um widget na tela inicial. Ao tocar no widget, ele abre o WORKNEO no formulário de lançamento rápido.

## O que o widget faz
- Abre o WORKNEO com o formulário rápido já aberto.
- Usa a sessão e os dados da instalação web/PWA no navegador que abrir o endereço.
- Mantém lista, cor e número do pedido entre lançamentos.
- Após lançar, limpa somente produto e quantidade.

## Gerar APK
O workflow **Build WORKNEO Quick Widget** compila um APK de depuração e publica o arquivo como artefato do GitHub Actions.

## Instalar e adicionar à tela inicial
1. Baixe o arquivo app-debug.apk no artefato do workflow e instale no Android, autorizando a instalação para essa origem quando solicitado.
2. Abra **WORKNEO Widget** uma vez e teste o botão.
3. Mantenha pressionada uma área vazia da tela inicial do Android.
4. Abra **Widgets**, procure **WORKNEO · Lançamento rápido** e arraste para a tela inicial.
5. Toque em **ADICIONAR ITEM** para abrir o formulário rápido.

O celular precisa ter conexão para abrir o site. Se o WORKNEO exigir login, entre com a mesma conta utilizada no computador.
