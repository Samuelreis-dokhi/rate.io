# Especificações do Projeto

<span style="color:red">Pré-requisitos: <a href="1-Documentação de Contexto.md"> Documentação de Contexto</a></span>

Definição do problema e ideia de solução a partir da perspectiva do usuário. É composta pela definição do  diagrama de personas, histórias de usuários, requisitos funcionais e não funcionais além das restrições do projeto.

Apresente uma visão geral do que será abordado nesta parte do documento, enumerando as técnicas e/ou ferramentas utilizadas para realizar a especificações do projeto

## Personas

Persona 1 – Lucas Andrade (República Universitária)

22 anos

Estudante de Engenharia

Mora com 4 colegas

Renda limitada

Usa Pix diariamente

Pouca paciência para planilhas

Dores:

Esquecem quem pagou contas

Conflitos por divisão desigual

Falta de registro histórico

Objetivo:
Ter divisão automática e transparente.

Persona 2 – Mariana Souza (Organizadora de Viagens)

29 anos

Profissional de Marketing

Organiza viagens com amigos

Costuma pagar reservas no cartão

Gosta de relatórios

Dores:

Parcelamentos longos

Cobranças desconfortáveis

Falta de controle consolidado

Objetivo:
Visualizar quem deve, quanto deve e quando deve pagar.

Persona 3 – Rafael Oliveira (Gestor Familiar)

35 anos

Empreendedor

Divide despesas familiares ampliadas

Quer visão macro consolidada

Dores:

Falta de controle global

Desorganização financeira

Objetivo:
Dashboard analítico completo.

> **Links Úteis**:
> - [Rock Content](https://rockcontent.com/blog/personas/)
> - [Hotmart](https://blog.hotmart.com/pt-br/como-criar-persona-negocio/)
> - [O que é persona?](https://resultadosdigitais.com.br/blog/persona-o-que-e/)
> - [Persona x Público-alvo](https://flammo.com.br/blog/persona-e-publico-alvo-qual-a-diferenca/)
> - [Mapa de Empatia](https://resultadosdigitais.com.br/blog/mapa-da-empatia/)
> - [Mapa de Stalkeholders](https://www.racecomunicacao.com.br/blog/como-fazer-o-mapeamento-de-stakeholders/)
>
Lembre-se que você deve ser enumerar e descrever precisamente e personalizada todos os clientes ideais que sua solução almeja.

## Histórias de Usuários

Com base na análise das personas forma identificadas as seguintes histórias de usuários:

| EU COMO | QUERO                             | PARA                             |
| ------- | --------------------------------- | -------------------------------- |
| Usuário | Criar um grupo de despesas        | Organizar contas compartilhadas  |
| Usuário | Convidar membros via link         | Facilitar entrada no grupo       |
| Usuário | Sair de um grupo                  | Não participar mais das despesas |
| Usuário | Registrar uma despesa             | Não esquecer gastos              |
| Usuário | Escolher tipo de divisão          | Garantir justiça                 |
| Usuário | Anexar comprovante                | Ter transparência                |
| Usuário | Parcelar despesa                  | Controlar pagamentos futuros     |
| Usuário | Visualizar saldo consolidado      | Saber quanto devo                |
| Usuário | Receber notificação de vencimento | Não atrasar pagamento            |
| Usuário | Gerar relatório mensal            | Controlar orçamento              |

| EU COMO       | QUERO                        | PARA                  |
| ------------- | ---------------------------- | --------------------- |
| Administrador | Alterar permissões           | Controlar organização |
| Administrador | Remover usuário inadimplente | Manter integridade    |





Apresente aqui as histórias de usuário que são relevantes para o projeto de sua solução. As Histórias de Usuário consistem em uma ferramenta poderosa para a compreensão e elicitação dos requisitos funcionais e não funcionais da sua aplicação. Se possível, agrupe as histórias de usuário por contexto, para facilitar consultas recorrentes à essa parte do documento.

> **Links Úteis**:
> - [Histórias de usuários com exemplos e template](https://www.atlassian.com/br/agile/project-management/user-stories)
> - [Como escrever boas histórias de usuário (User Stories)](https://medium.com/vertice/como-escrever-boas-users-stories-hist%C3%B3rias-de-usu%C3%A1rios-b29c75043fac)
> - [User Stories: requisitos que humanos entendem](https://www.luiztools.com.br/post/user-stories-descricao-de-requisitos-que-humanos-entendem/)
> - [Histórias de Usuários: mais exemplos](https://www.reqview.com/doc/user-stories-example.html)
> - [9 Common User Story Mistakes](https://airfocus.com/blog/user-story-mistakes/)

-----

## Requisitos Funcionais

> Prioridade definida pela técnica **MoSCoW** — detalhada na seção correspondente.

| ID | Descrição | Prioridade | Responsável |
|:---|:----------|:----------:|:-----------:|
| `RF-001` | Cadastrar e autenticar usuário (e-mail/senha e OAuth) | 🔴 ALTA | Rondinelli |
| `RF-002` | Criar grupo de despesas com nome e tipo *(república, viagem, lazer)* | 🔴 ALTA | Rondinelli |
| `RF-003` | Convidar membros ao grupo via link compartilhável | 🔴 ALTA | Louise |
| `RF-004` | Registrar despesa com valor, descrição, data e comprovante *(imagem)* | 🔴 ALTA | Louise |
| `RF-005` | Definir tipo de divisão: igualitária, por percentual ou por valor exato | 🔴 ALTA | Samuel |
| `RF-006` | Parcelar despesa em N meses com geração automática de cobranças mensais | 🔴 ALTA | Samuel |
| `RF-007` | Visualizar saldo consolidado individual *(quanto devo / quanto me devem)* | 🔴 ALTA | Heitor |
| `RF-008` | Enviar notificação de vencimento de parcela e cobrança pendente | 🟡 MÉDIA | Heitor |
| `RF-009` | Registrar pagamento de dívida *(marcar como pago com comprovante)* | 🔴 ALTA | Ícaro |
| `RF-010` | Administrador pode alterar permissões e remover membros do grupo | 🟡 MÉDIA | Ícaro |
| `RF-011` | Sair de um grupo *(usuário encerra participação e mantém acesso ao histórico)* | 🟢 BAIXA | Vinicius |
| `RF-012` | Exportar extrato de despesas em PDF ou CSV | 🟢 BAIXA | Vinicius |

---

##  Requisitos Não Funcionais

| ID | Categoria | Descrição | Critério de Aceitação |
|:---|:----------|:----------|:----------------------|
| `RNF-001` | Desempenho | O sistema deve responder às requisições da API em no máximo **2 segundos** em condições normais de uso. | 95% das requisições < 2s medido via teste de carga |
| `RNF-002` |  Disponibilidade | A aplicação deve estar disponível **99% do tempo** (SLA), com janelas de manutenção fora do horário de pico. | Uptime monitorado via serviço em nuvem |
| `RNF-003` |  Segurança | Senhas e tokens armazenados com **criptografia**. Comunicação exclusivamente via **HTTPS/TLS**. Autenticação por **JWT**. | Auditoria de segurança + testes de autenticação |
| `RNF-004` |  Usabilidade | A interface mobile deve permitir o registro de uma despesa em no máximo **4 toques** a partir da tela inicial. | Teste de usabilidade com 5 usuários reais |
| `RNF-005` |  Escalabilidade | A arquitetura em nuvem deve suportar até **500 usuários simultâneos** sem degradação de performance. | Teste de carga com k6 ou JMeter |
| `RNF-006` |  Manutenibilidade | Código seguindo **clean code** com cobertura mínima de **60%** por testes automatizados (unitários/integração). | Relatório de cobertura gerado no CI/CD pipeline |

---

## Restrições

> As restrições limitam as soluções candidatas e devem ser respeitadas durante todo o desenvolvimento.

| ID | Restrição | Justificativa |
|:---|:----------|:--------------|
| `R-01` | Entrega até o final do semestre letivo | O projeto é avaliado dentro do calendário acadêmico vigente, sem possibilidade de prorrogação. |
| `R-02` | Deve usar **arquitetura distribuída** *(cliente-servidor com API REST centralizada)* | Requisito técnico que exige separação entre front-end (web/mobile) e back-end comunicando via API. |
| `R-03` | Deve possuir versão **web** e versão **mobile** funcionais | Ambas as plataformas são obrigatórias para atender os diferentes perfis de uso. |
| `R-04` | Hospedagem obrigatória em **nuvem** *(ex: Render, Railway, Firebase, Vercel)* | A sincronização em tempo real entre dispositivos exige back-end e banco de dados em nuvem. |
| `R-05` | Banco de dados **NoSQL** *(ex: MongoDB, Firestore)* | Definido no escopo para garantir flexibilidade no esquema de dados e escalabilidade horizontal. |
| `R-06` | **Orçamento zero** — utilizar apenas planos gratuitos *(free tier)* | Projeto acadêmico sem financiamento; toda a stack deve operar nos planos gratuitos das plataformas. |

---

##  Priorização MoSCoW

> A técnica **MoSCoW** classifica os requisitos em quatro categorias, permitindo que a equipe foque no que é essencial para a entrega dentro do semestre.  
> A aplicação foi feita em reunião de equipe, avaliando **impacto para o usuário**, **viabilidade técnica** e **dependências entre funcionalidades**.

### Como funciona

```
M — Must Have   → Deve ter obrigatoriamente
S — Should Have → Deveria ter, alta importância
C — Could Have  → Poderia ter, se houver tempo
W — Won't Have  → Não entra neste ciclo
```

### Classificação

| Categoria | Requisitos | Critério |
|:----------|:-----------|:---------|
| 🔴 **Must Have** | `RF-001` `RF-002` `RF-003` `RF-004` `RF-005` `RF-006` `RF-007` `RF-009` | Sem estas funcionalidades o app não cumpre seu propósito central de registrar e dividir despesas. |
| 🟡 **Should Have** | `RF-008` `RF-010` | Agregam valor significativo e melhoram a experiência, mas a ausência não inviabiliza o produto no semestre. |
| 🟢 **Could Have** | `RF-011` `RF-012` | Desejáveis, mas de baixo impacto imediato; implementados somente se houver tempo disponível. |
| ⚪ **Won't Have** | — | Integrações bancárias automáticas, OCR de nota fiscal e suporte a múltiplas moedas ficam fora do escopo deste ciclo. |

---

##  Distribuição entre Integrantes

> Cada integrante é responsável pela execução completa **(back-end + web + mobile)** dos seus requisitos.

| Integrante | Requisitos | Escopo |
|:-----------|:----------:|:-------|
| **Rondinelli** | `RF-001` `RF-002` | Autenticação de usuários · Criação de grupos |
| **Louise** | `RF-003` `RF-004` | Convite de membros · Registro de despesas |
| **Samuel** | `RF-005` `RF-006` | Tipos de divisão · Parcelamento |
| **Heitor** | `RF-007` `RF-008` | Saldo consolidado · Notificações de vencimento |
| **Ícaro** | `RF-009` `RF-010` | Registro de pagamentos · Gestão de permissões |
| **Vinicius** | `RF-011` `RF-012` | Saída de grupo · Exportação de extrato |

---


## Diagrama de Casos de Uso

O diagrama de casos de uso é o próximo passo após a elicitação de requisitos, que utiliza um modelo gráfico e uma tabela com as descrições sucintas dos casos de uso e dos atores. Ele contempla a fronteira do sistema e o detalhamento dos requisitos funcionais com a indicação dos atores, casos de uso e seus relacionamentos. 

As referências abaixo irão auxiliá-lo na geração do artefato “Diagrama de Casos de Uso”.

> **Links Úteis**:
> - [Criando Casos de Uso](https://www.ibm.com/docs/pt-br/elm/6.0?topic=requirements-creating-use-cases)
> - [Como Criar Diagrama de Caso de Uso: Tutorial Passo a Passo](https://gitmind.com/pt/fazer-diagrama-de-caso-uso.html/)
> - [Lucidchart](https://www.lucidchart.com/)
> - [Astah](https://astah.net/)
> - [Diagrams](https://app.diagrams.net/)


# Gerenciamento de Projeto

De acordo com o PMBoK v6 as dez áreas que constituem os pilares para gerenciar projetos, e que caracterizam a multidisciplinaridade envolvida, são: Integração, Escopo, Cronograma (Tempo), Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas. Para desenvolver projetos um profissional deve se preocupar em gerenciar todas essas dez áreas. Elas se complementam e se relacionam, de tal forma que não se deve apenas examinar uma área de forma estanque. É preciso considerar, por exemplo, que as áreas de Escopo, Cronograma e Custos estão muito relacionadas. Assim, se eu amplio o escopo de um projeto eu posso afetar seu cronograma e seus custos.

## Gerenciamento de Tempo

Com diagramas bem organizados que permitem gerenciar o tempo nos projetos, o gerente de projetos agenda e coordena tarefas dentro de um projeto para estimar o tempo necessário de conclusão.


<img width="797" height="428" alt="image" src="https://github.com/user-attachments/assets/92ad0f85-ae8a-4e3c-9d45-64521158c6df" />
)](img/02-diagrama-rede-simplificado.png)

O gráfico de Gantt ou diagrama de Gantt também é uma ferramenta visual utilizada para controlar e gerenciar o cronograma de atividades de um projeto. Com ele, é possível listar tudo que precisa ser feito para colocar o projeto em prática, dividir em atividades e estimar o tempo necessário para executá-las.

![Gráfico de Gantt](img/02-grafico-gantt.png)

## Gerenciamento de Equipe

O gerenciamento adequado de tarefas contribuirá para que o projeto alcance altos níveis de produtividade. Por isso, é fundamental que ocorra a gestão de tarefas e de pessoas, de modo que os times envolvidos no projeto possam ser facilmente gerenciados. 

![Simple Project Timeline](img/02-project-timeline.png)

