# ViaCEP

Esta pasta isola a futura integração com o ViaCEP.

## Contrato usado pelo aplicativo

`index.js` expõe somente:

- `searchCep(query)`
- `getCep(cep)`

Hoje essas funções usam `mock/provider.js`. Quando a integração real for instalada, substitua a implementação interna de `index.js` ou o provider, preservando o formato de retorno:

```js
{
  cep: "16400-001",
  logradouro: "Rua das Acácias",
  bairro: "Centro",
  localidade: "Lins",
  uf: "SP",
  estado: "São Paulo"
}
```

As telas não devem importar arquivos de `mock/` diretamente.

## Busca bidirecional

O contrato também expõe `searchAddress(query)`. A interface utiliza essa função para localizar um CEP a partir de rua, bairro ou cidade. O mock atual simula esse comportamento. Ao substituir pelo ViaCEP real, preserve os contratos `searchCep`, `searchAddress` e `getCep`; as telas não precisam ser alteradas.
