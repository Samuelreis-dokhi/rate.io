# Testes Unitários no Backend

## O que são Testes Unitários?

Testes unitários são testes automatizados escritos e executados para garantir que pequenas partes individuais do código (unidades) funcionem conforme esperado. No contexto do desenvolvimento backend, isso geralmente significa testar funções, métodos, ou classes de maneira isolada, sem dependências externas como bancos de dados ou serviços web.

## Por que são Importantes?

Testes unitários ajudam a:

- Identificar problemas de maneira precoce no ciclo de desenvolvimento.
- Garantir que o código continue funcionando após alterações (regressões).
- Facilitar o processo de refatoração.
- Melhorar a confiabilidade e a qualidade do software.

## Configuração do Ambiente

Para começar a escrever testes unitários em um projeto backend utilizando C#, siga os passos abaixo:

1. **Instale o .NET SDK**: Certifique-se de ter o [.NET SDK](https://dotnet.microsoft.com/download) instalado.

2. **Crie um projeto de testes**: No terminal, navegue até o diretório do seu projeto e execute o seguinte comando para criar um projeto de testes usando xUnit (um framework popular de testes unitários para .NET):

   ```bash
   dotnet new xunit -o tests
   ```

3. **Adicione uma referência ao seu projeto principal**: No diretório do projeto de testes, adicione uma referência ao seu projeto principal:

   ```bash
   dotnet add reference ../src/MyProject.csproj
   ```

4. **Organize sua estrutura de diretórios**: Uma estrutura comum de projeto é a seguinte:

   ```
   MyProject/
   ├── src/
   │   └── MyProject.cs
   └── tests/
       └── MyProject.Tests.cs
   ```

## Exemplo de Teste Unitário

Aqui está um exemplo simples de um teste unitário em C# usando xUnit. Vamos supor que temos um método na classe `Calculator` que soma dois números.

```csharp
// src/MyProject.cs

namespace MyProject
{
    public class Calculator
    {
        public int Add(int a, int b)
        {
            return a + b;
        }
    }
}
```

## Registro de Execucao - 2026-04-10

### Contexto

- Diretorio de execucao: `src/backend`
- Comando executado: `npm run test:unit`

### Resultado

- Status geral: falha
- Suites: 2 falharam, 2 no total
- Testes: 1 falhou, 21 passaram, 22 no total
- Snapshots: 0
- Tempo total: 0.349 s

### Falhas observadas

1. Arquivo: `tests/unit/spliteService.test.js`
   - Cenario: `splitService > calculateSplit > delega para calculateEqualSplit quando tipo e "igual"`
   - Erro: `Detalhes da divisao sao obrigatorios e devem ser um array nao vazio.`
   - Origem no servico: `services/splitService.js:74`

2. Arquivo: `tests/unit/balanceService.test.js`
   - Erro: `Your test suite must contain at least one test.`
   - Causa imediata: suite sem casos de teste declarados.

### Proximo passo recomendado

1. Ajustar dados de entrada do teste de `spliteService` para enviar `splitData` valido no tipo `igual`.
2. Criar ao menos um teste real em `balanceService.test.js` ou remover o arquivo ate a implementacao dos cenarios.
