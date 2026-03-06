# Arquitetura da Solução

## Definição e Documentação da Arquitetura Distribuída

A arquitetura do **RATE.IO** foi projetada seguindo os princípios de sistemas distribuídos modernos, garantindo o desacoplamento entre as interfaces de usuário e a lógica de negócio centralizada. Essa estrutura permite que diferentes plataformas consumam os mesmos serviços de forma independente e escalável.

A solução divide-se em três camadas principais:

### 1. Camada de Cliente (Front-end e Mobile)
O sistema utiliza clientes heterogêneos desenvolvidos em ecossistema JavaScript/TypeScript, garantindo agilidade no desenvolvimento e consistência da interface:
* **Aplicação Web:** Desenvolvida para oferecer uma visão gerencial profunda, com relatórios de gastos e administração completa de grupos.
* **Aplicação Mobile:** Focada na mobilidade e agilidade operacional, permitindo lançamentos de despesas em tempo real e consultas imediatas de saldo consolidado.
* Ambos os clientes comunicam-se com o servidor exclusivamente via protocolo HTTPS, utilizando o formato JSON para o intercâmbio de dados.

### 2. Camada de Comunicação e Testes (REST API & Postman)
Utilizamos uma API REST centralizada na nuvem que atua como o ponto único de entrada (Gateway) para todas as requisições, servindo como fonte única de verdade para os dados.

* **Roteamento e Lógica:** A API processa as chamadas dos diferentes clientes, valida a autenticação dos usuários via JWT e direciona as operações para o motor de cálculo de rateio.
* **Validação com Postman:** Durante todo o ciclo de desenvolvimento e QA, o Postman é utilizado para documentar os endpoints, realizar testes de integração e garantir a integridade das respostas da API antes da integração com as interfaces finais.

### 3. Camada de Processamento e Dados (Backend e SQL)
A lógica de negócio está isolada em um ambiente de execução em nuvem, garantindo que o processamento das divisões financeiras seja realizado de forma atômica.
* **Serviços de Backend (Node.js):** Responsáveis por interpretar as regras de divisão (igualitária, percentual ou valor exato) e gerenciar o histórico de transações e notificações de vencimento.

* **Persistência Não Relacional (NoSQL):** Os dados são armazenados no MongoDB Atlas. A escolha por um banco de dados NoSQL justifica-se pela natureza dinâmica e flexível dos grupos de despesas, permitindo armazenar documentos complexos de "Grupos" com listas variáveis de participantes e transações sem a rigidez de esquemas tabulares.

### Ambiente de Hospedagem e Ferramentas
Para viabilizar a natureza distribuída e o requisito de custo zero de infraestrutura:
* **Backend:** Publicado em plataformas PaaS (como Render ou Railway).
* **Banco de Dados:** Cluster gerenciado na nuvem via MongoDB Atlas, garantindo alta disponibilidade e escalabilidade.
* **Frontend Web:** Distribuído via plataformas de deploy contínuo (Vercel ou Netlify) para garantir baixa latência.


## Diagrama de Classes

O diagrama de classes ilustra graficamente como será a estrutura do software, e como cada uma das classes da sua estrutura estarão interligadas. Essas classes servem de modelo para materializar os objetos que executarão na memória.

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Classes”.

> - [Diagramas de Classes - Documentação da IBM](https://www.ibm.com/docs/pt-br/rational-soft-arch/9.6.1?topic=diagrams-class)
> - [O que é um diagrama de classe UML? | Lucidchart](https://www.lucidchart.com/pages/pt/o-que-e-diagrama-de-classe-uml)

## Documentação do Banco de Dados MongoDB

Este documento descreve a estrutura e o esquema do banco de dados não relacional utilizado por nosso projeto, baseado em MongoDB. O MongoDB é um banco de dados NoSQL que armazena dados em documentos JSON (ou BSON, internamente), permitindo uma estrutura flexível e escalável para armazenar e consultar dados.

## Esquema do Banco de Dados
### Coleção: users
Armazena as informações dos usuários do sistema.

Estrutura do Documento

```Json
{
    "_id": "ObjectId('5f7e1bbf9b2a4f1a9c38b9a1')",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "passwordHash": "hash_da_senha",
    "roles": ["admin", "user"],
    "createdAt": "2024-08-29T10:00:00Z",
    "updatedAt": "2024-08-29T12:00:00Z"
}
```

#### Descrição dos Campos
> - <strong>_id:</strong> Identificador único do usuário gerado automaticamente pelo MongoDB.
> - <strong>name:</strong> Nome completo do usuário.
> - <strong>email:</strong> Endereço de email do usuário.
> - <strong>passwordHash:</strong> Hash da senha do usuário.
> - <strong>roles:</strong> Lista de papéis atribuídos ao usuário (por exemplo, admin, user).
> - <strong>createdAt:</strong> Data e hora de criação do usuário.
> - <strong>updatedAt:</strong> Data e hora da última atualização dos dados do usuário.

### Coleção: products
Armazena as informações dos produtos disponíveis no sistema.

```Json
{
    "_id": "ObjectId('5f7e1ccf9b2a4f1a9c38b9a2')",
    "name": "Produto Exemplo",
    "description": "Descrição detalhada do produto.",
    "price": 99.99,
    "category": "Categoria Exemplo",
    "stock": 100,
    "createdAt": "2024-08-29T10:30:00Z",
    "updatedAt": "2024-08-29T11:30:00Z"
}
```

#### Descrição dos Campos
> - <strong>_id:</strong> Identificador único do usuário gerado automaticamente pelo MongoDB.
> - <strong>name:</strong> Nome completo do usuário.
> - <strong>email:</strong> Endereço de email do usuário.
> - <strong>passwordHash:</strong> Hash da senha do usuário.
> - <strong>roles:</strong> Lista de papéis atribuídos ao usuário (por exemplo, admin, user).
> - <strong>createdAt:</strong> Data e hora de criação do usuário.
> - <strong>updatedAt:</strong> Data e hora da última atualização dos dados do usuário.

### Coleção: products
Armazena as informações dos produtos disponíveis no sistema.

Estrutura do Documento

```Json
{
    "_id": "ObjectId('5f7e1ccf9b2a4f1a9c38b9a2')",
    "name": "Produto Exemplo",
    "description": "Descrição detalhada do produto.",
    "price": 99.99,
    "category": "Categoria Exemplo",
    "stock": 100,
    "createdAt": "2024-08-29T10:30:00Z",
    "updatedAt": "2024-08-29T11:30:00Z"
}
```

#### Descrição dos Campos
> - <strong>_id:</strong> Identificador único do produto gerado automaticamente pelo MongoDB.
> - <strong>name:</strong> Nome do produto.
> - <strong>description:</strong> Descrição detalhada do produto.
> - <strong>price:</strong> Preço do produto.
> - <strong>category:</strong> Categoria à qual o produto pertence.
> - <strong>stock:</strong> Quantidade de produtos em estoque.
> - <strong>createdAt:</strong> Data e hora de criação do produto.
> - <strong>updatedAt:</strong> Data e hora da última atualização dos dados do produto.

### Coleção: orders
Armazena as informações dos pedidos feitos pelos usuários.

Estrutura do Documento

```Json
{
    "_id": "ObjectId('5f7e1ddf9b2a4f1a9c38b9a3')",
    "userId": "ObjectId('5f7e1bbf9b2a4f1a9c38b9a1')",
    "products": [
        {
            "productId": "ObjectId('5f7e1ccf9b2a4f1a9c38b9a2')",
            "quantity": 2,
            "price": 99.99
        }
    ],
    "totalPrice": 199.98,
    "status": "pending",
    "createdAt": "2024-08-29T11:00:00Z",
    "updatedAt": "2024-08-29T11:30:00Z"
}
```

#### Descrição dos Campos
> - <strong>_id:</strong> Identificador único do pedido gerado automaticamente pelo MongoDB.
> - <strong>userId:</strong> Referência ao identificador do usuário que fez o pedido.
> - <strong>products:</strong> Lista de produtos incluídos no pedido, cada um com:
> - <strong>productId:</strong> Identificador do produto.
> - <strong>quantity:</strong> Quantidade do produto pedido.
> - <strong>price:</strong> Preço unitário do produto no momento do pedido.
> - <strong>totalPrice:</strong> Preço total do pedido (soma de todos os itens).
> - <strong>status:</strong> Status atual do pedido (por exemplo, pending, shipped, delivered).
> - <strong>createdAt:</strong> Data e hora de criação do pedido.
> - <strong>updatedAt:</strong> Data e hora da última atualização dos dados do pedido.

### Boas Práticas

Validação de Dados: Implementar validação de esquema e restrições na aplicação para garantir a consistência dos dados.

Monitoramento e Logs: Utilize ferramentas de monitoramento e logging para acompanhar a saúde do banco de dados e diagnosticar problemas.

Escalabilidade: Considere estratégias de sharding e replicação para lidar com crescimento do banco de dados e alta disponibilidade.

### Material de Apoio da Etapa

Na etapa 2, em máterial de apoio, estão disponíveis vídeos com a configuração do mongo.db e a utilização com Bson no C#


## Modelo ER (Somente se tiver mais de um banco e outro for relacional)

O Modelo ER representa através de um diagrama como as entidades (coisas, objetos) se relacionam entre si na aplicação interativa.

As referências abaixo irão auxiliá-lo na geração do artefato “Modelo ER”.

> - [Como fazer um diagrama entidade relacionamento | Lucidchart](https://www.lucidchart.com/pages/pt/como-fazer-um-diagrama-entidade-relacionamento)

## Esquema Relacional (Somente se tiver mais de um banco e outro for relacional)

O Esquema Relacional corresponde à representação dos dados em tabelas juntamente com as restrições de integridade e chave primária.
 
As referências abaixo irão auxiliá-lo na geração do artefato “Esquema Relacional”.

> - [Criando um modelo relacional - Documentação da IBM](https://www.ibm.com/docs/pt-br/cognos-analytics/10.2.2?topic=designer-creating-relational-model)

## Modelo Físico (Somente se tiver mais de um banco e outro for relacional)

Entregar um arquivo banco.sql contendo os scripts de criação das tabelas do banco de dados. Este arquivo deverá ser incluído dentro da pasta src\bd.

## Tecnologias Utilizadas

Descreva aqui qual(is) tecnologias você vai usar para resolver o seu problema, ou seja, implementar a sua solução. Liste todas as tecnologias envolvidas, linguagens a serem utilizadas, serviços web, frameworks, bibliotecas, IDEs de desenvolvimento, e ferramentas.

Apresente também uma figura explicando como as tecnologias estão relacionadas ou como uma interação do usuário com o sistema vai ser conduzida, por onde ela passa até retornar uma resposta ao usuário.

## Hospedagem

Explique como a hospedagem e o lançamento da plataforma foi feita.

> **Links Úteis**:
>
> - [Website com GitHub Pages](https://pages.github.com/)
> - [Programação colaborativa com Repl.it](https://repl.it/)
> - [Getting Started with Heroku](https://devcenter.heroku.com/start)
> - [Publicando Seu Site No Heroku](http://pythonclub.com.br/publicando-seu-hello-world-no-heroku.html)

## Qualidade de Software

Conceituar qualidade de fato é uma tarefa complexa, mas ela pode ser vista como um método gerencial que através de procedimentos disseminados por toda a organização, busca garantir um produto final que satisfaça às expectativas dos stakeholders.

No contexto de desenvolvimento de software, qualidade pode ser entendida como um conjunto de características a serem satisfeitas, de modo que o produto de software atenda às necessidades de seus usuários. Entretanto, tal nível de satisfação nem sempre é alcançado de forma espontânea, devendo ser continuamente construído. Assim, a qualidade do produto depende fortemente do seu respectivo processo de desenvolvimento.

A norma internacional ISO/IEC 25010, que é uma atualização da ISO/IEC 9126, define oito características e 30 subcaracterísticas de qualidade para produtos de software.
Com base nessas características e nas respectivas sub-características, identifique as sub-características que sua equipe utilizará como base para nortear o desenvolvimento do projeto de software considerando-se alguns aspectos simples de qualidade. Justifique as subcaracterísticas escolhidas pelo time e elenque as métricas que permitirão a equipe avaliar os objetos de interesse.

> **Links Úteis**:
>
> - [ISO/IEC 25010:2011 - Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models](https://www.iso.org/standard/35733.html/)
> - [Análise sobre a ISO 9126 – NBR 13596](https://www.tiespecialistas.com.br/analise-sobre-iso-9126-nbr-13596/)
> - [Qualidade de Software - Engenharia de Software 29](https://www.devmedia.com.br/qualidade-de-software-engenharia-de-software-29/18209/)
