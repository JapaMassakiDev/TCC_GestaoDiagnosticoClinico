# CID-11 adapter

Esta pasta isola a futura integração com a API CID-11 da OMS.

Contrato consumido pelo app:

```js
searchCid11(query) => Promise<Array<{ id, code, title, description }>>
```

Hoje `index.js` usa `mock/provider.js`. Quando a API real for instalada, preserve a assinatura exportada por `index.js` e troque somente a implementação desta pasta. Nenhuma tela deve importar o mock diretamente.
