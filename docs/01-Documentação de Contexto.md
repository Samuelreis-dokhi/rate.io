# Introdução

O gerenciamento de finanças compartilhadas é um desafio comum em diversos contextos sociais contemporâneos. Seja na divisão de despesas fixas em moradias compartilhadas (repúblicas), na organização de custos variáveis durante viagens em grupo ou no simples rateio de contas em eventos sociais e saídas de lazer, a falta de uma metodologia clara frequentemente gera atritos interpessoais e desorganização financeira. Este projeto propõe o desenvolvimento de uma aplicação distribuída focada na transparência e automação da divisão de gastos, integrando a praticidade do acesso móvel para lançamentos imediatos à robustez de uma interface web para análises gerenciais profundas.

## Problema

O gerenciamento de finanças coletivas e individuais enfrenta um obstáculo recorrente: o ônus cognitivo e a descentralização das informações. Atualmente, a ausência de uma ferramenta integrada que una o controle de gastos pessoais ao rateio de despesas de grupo força os usuários a utilizarem métodos arcaicos ou isolados, como anotações informais e planilhas estáticas.
Os principais pontos de dor que compõem este problema são:
### - Complexidade em Divisões Não-Equitativas: Em contextos sociais (festas, bares ou restaurantes), o rateio raramente é igualitário. A necessidade de realizar cálculos manuais proporcionais ao consumo individual gera margem para erros matemáticos e situações de desconforto social.
### - Gestão de Passivos e Longo Prazo: Despesas de alto valor ou recorrentes (como aluguel de moradias compartilhadas ou parcelamento de eletrônicos para uso comum) criam "dívidas fantasmas". Sem um histórico formal e um sistema de alertas, o controle desses saldos ao longo dos meses torna-se insustentável.
### - Fragmentação da Visão Macroeconômica: O indivíduo perde a noção do impacto real das despesas compartilhadas em seu orçamento pessoal. A falta de uma visão consolidada impede que o usuário saiba, de forma imediata, quanto de sua reserva financeira já está comprometida com dívidas de diferentes contextos (república, viagens e lazer).
### - Gargalos de Sincronização e Mobilidade: A falta de uma plataforma acessível no momento exato da transação leva ao esquecimento de registros. No contexto de Sistemas Distribuídos, a ausência de uma arquitetura que garanta a persistência em nuvem e a sincronização entre dispositivos móveis e web resulta em saldos finais injustos e dados inconsistentes entre os membros do grupo.

### Contexto de uso:

A aplicação será utilizada por indivíduos que buscam otimizar sua saúde financeira através da tecnologia. No contexto acadêmico e profissional, utiliza-se a arquitetura de Sistemas Distribuídos para garantir que os dados inseridos via dispositivos móveis (em situações de mobilidade) estejam imediatamente disponíveis para consulta e gestão em plataformas web, utilizando armazenamento em nuvem para garantir a persistência e a integridade das informações entre todos os envolvidos.

## Objetivos

O objetivo geral deste projeto é desenvolver uma aplicação distribuída multiplataforma para a gestão e o rateio de despesas coletivas, visando automatizar cálculos de saldo e promover a transparência financeira entre participantes de diferentes contextos sociais, como moradias compartilhadas e viagens em grupo.

### Objetivos Específicos

- Interoperabilidade: Desenvolver uma API REST centralizada na nuvem que sirva como fonte única de dados para clientes distintos (Web e Mobile), garantindo a consistência das informações em tempo real.

- Flexibilidade de Divisão: Implementar algoritmos de cálculo que suportem múltiplas abordagens de rateio, incluindo divisões igualitárias, por percentual e por valor exato de consumo individual.

- Gestão de Recorrência: Automatizar o controle de despesas parceladas e fixas, gerando cobranças mensais automáticas para reduzir o esquecimento de dívidas de longo prazo.

- Persistência Não Relacional: Estruturar o armazenamento de dados utilizando um banco de dados NoSQL para permitir a escalabilidade e a flexibilidade necessária para lidar com diferentes perfis de grupos e transações.
 

## Justificativa

A motivação para o desenvolvimento desta aplicação reside na necessidade de democratizar e automatizar a saúde financeira através da tecnologia. A escolha deste tema justifica-se pela crescente complexidade das relações de consumo modernas, onde o compartilhamento de bens e serviços (economia compartilhada) tornou-se uma norma entre estudantes e jovens profissionais.
### Razões para o desenvolvimento e aprofundamento técnico:
### - Redução de Atritos Sociais e Financeiros: A aplicação visa eliminar a "cobrança manual", automatizando o processo de lembretes e transparência de gastos. Isso garante que a justiça financeira seja mantida sem desgastar as relações interpessoais.
### - Arquitetura de Sistemas Distribuídos: Aprofundar-se neste aspecto é fundamental para garantir a integridade dos dados. Em um cenário de gastos em grupo, a concorrência de acessos e a necessidade de disponibilidade imediata exigem o uso de armazenamento em nuvem e sincronização em tempo real, permitindo que um gasto inserido em um dispositivo móvel durante uma viagem seja imediatamente refletido no painel de controle de todos os envolvidos.
### - Centralização de Fluxo de Caixa: Diferente de soluções que focam apenas em "dividir a conta", este projeto justifica-se pela integração com a gestão pessoal. O objetivo é permitir que o usuário gerencie seu saldo fixo e proporcional em um único ecossistema, oferecendo uma visão holística de suas finanças.
### - Base em Dados e Necessidade de Mercado: Observa-se, através de levantamentos preliminares em ambientes acadêmicos (repúblicas e grupos de viagem), que o uso de ferramentas manuais ainda é predominante, resultando em uma taxa considerável de esquecimento de cobranças e desorganização orçamentária.

A aplicação, portanto, não se limita a uma calculadora de divisões, mas propõe-se a ser um hub de saúde financeira que mitiga o erro humano e otimiza o tempo do usuário através de uma interface intuitiva.

## Público-Alvo

Descreva quem serão as pessoas que usarão a sua aplicação indicando os diferentes perfis. O objetivo aqui não é definir quem serão os clientes ou quais serão os papéis dos usuários na aplicação. A ideia é, dentro do possível, conhecer um pouco mais sobre o perfil dos usuários: conhecimentos prévios, relação com a tecnologia, relações
hierárquicas, etc.

Adicione informações sobre o público-alvo por meio de uma descrição textual, diagramas de personas e mapa de stakeholders.

> **Links Úteis**:
> - [Público-alvo](https://blog.hotmart.com/pt-br/publico-alvo/)
> - [Como definir o público alvo](https://exame.com/pme/5-dicas-essenciais-para-definir-o-publico-alvo-do-seu-negocio/)
> - [Público-alvo: o que é, tipos, como definir seu público e exemplos](https://klickpages.com.br/blog/publico-alvo-o-que-e/)
> - [Qual a diferença entre público-alvo e persona?](https://rockcontent.com/blog/diferenca-publico-alvo-e-persona/)
