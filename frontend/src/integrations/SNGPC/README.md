# SNGPC adapter

Esta pasta isola a futura integração com a fonte de medicamentos da ANVISA/SNGPC.

Contrato consumido pelo app:

```js
searchSngpcMedications(query) => Promise<Array<{ id, name, activeIngredient, administrationRoute, registry }>>
```

Hoje `index.js` usa `mock/provider.js`. Quando a integração real for instalada, preserve a assinatura exportada por `index.js` e troque somente a implementação desta pasta. Nenhuma tela deve importar o mock diretamente.
