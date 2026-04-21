## Estrutura CSS

A estilização do frontend é dividida em 2 arquivos:

- `src/index.css`: tema global, redefinição, importação de variáveis e tipografia base.
- `src/App.css`: estilização específica de páginas e componentes.

### Imagens
- Landing page e outras páginas podem utilizar imagens diponíveis em /public/images



### O que foi otimizado

- removidos estilos não usados em `src/App.css` como `#center`, `#next-steps`, `#docs` e `.ticks`.
- removida a borda fixa de `#root` e o background de página com gradiente pesado.
- atualizado o layout para full width responsivo, com `content-wrap` centralizando o conteúdo e permitindo espaçamento amplo.

### Melhores práticas aplicadas

- conteúdo global em `src/index.css`
- páginas e componentes em `src/App.css`
- uso de classes semânticas para hero, painel e cards
- responsividade garantida com media queries para tablets e celulares
