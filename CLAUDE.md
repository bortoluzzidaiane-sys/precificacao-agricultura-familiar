# CLAUDE.md — App de Precificação da Agricultura Familiar

> Este arquivo orienta o Claude Code em todas as sessões deste projeto.
> Leia-o inteiro antes de qualquer tarefa. Em caso de conflito entre um pedido e este arquivo, pergunte antes de agir.

---

## 1. Contexto do projeto

- **Projeto:** TED Nº 65/2025 — CONAB / Universidade Federal de Mato Grosso (UFMT)
  "Capacitação de agricultores familiares em ferramentas tecnológicas que aprimorem a produção e comércio de alimentos em Mato Grosso"
- **Coordenação acadêmica:** Profª Drª Daiane Antonini Bortoluzzi — Departamento de Administração, UFMT, Cuiabá-MT
- **Encaixe no Plano de Trabalho:** Meta 3 (capacitar produtores em gestão, vendas e tecnologias digitais), em especial a **Ação 3.1.2** — "módulos de gestão (custos, precificação, fluxo de caixa) e disponibilizar planilhas simples". Também atende o Objetivo Específico 3 (estratégias de precificação).
- **Atenção:** o Plano de Trabalho não prevê este app nominalmente. Ele é um instrumento de apoio às capacitações, **separado** da plataforma de comercialização da Meta 2. Não misturar escopo com a Meta 2 sem decisão da coordenação.
- **Origem da lógica de cálculo:** planilha de precificação validada pela coordenação (versão 2), com as revisões contábeis aprovadas em 18/10/2026 (seção 9).

## 2. Para quem é o app

Dois públicos, um mesmo app:

| Público | Perfil | Como o app responde |
|---|---|---|
| **Modo Simples** (padrão) | Agricultores com baixa escolaridade, pouca familiaridade com celular, leitura limitada | Uma pergunta por tela, botões grandes, ícones, números grandes, sem jargão, possibilidade de ouvir o texto (leitura em voz alta) |
| **Modo Completo** | Técnicos, articuladores das comunidades, agricultores com formação, equipe do projeto | Todas as categorias de custo, valores exatos, tabelas, resumo do mês, exportação |

Os dois modos usam **exatamente as mesmas fórmulas** (seção 5). Muda só a apresentação e o nível de detalhe pedido.

## 3. Princípios inegociáveis

1. **Funciona sem internet.** Depois do primeiro acesso, o app inteiro deve abrir e calcular offline.
2. **Os dados ficam no celular do agricultor.** Nada é enviado a servidor nesta versão. Sem login.
3. **Celular Android simples é o alvo.** Testar em tela de 360 px de largura, aparelho lento, pouca memória.
4. **Português do Brasil, linguagem do campo.** Frases curtas. Nada de "rateio", "depreciação", "markup" na tela do Modo Simples (ver seção 6).
5. **Moeda em real:** `R$ 1.234,56`. Aceitar digitação com vírgula.
6. **Acessibilidade:** contraste alto, fonte mínima de 18 px no Modo Simples, áreas de toque de pelo menos 48 × 48 px, nunca depender só de cor (usar ícone + texto também).
7. **Fórmulas são do domínio contábil, não do programador.** Nunca altere uma fórmula, um arredondamento ou um termo das seções 5–6 sem autorização explícita da coordenação.

## 4. Tecnologia

- **Tipo de app:** PWA (Progressive Web App) — instalável na tela inicial, funciona offline.
- **Stack:** Vite + React + TypeScript; `vite-plugin-pwa` para o service worker e o manifesto.
- **Armazenamento local:** IndexedDB (via biblioteca leve, ex.: `idb`), com cópia de segurança exportável em arquivo.
- **Estilo:** CSS simples ou Tailwind; sem bibliotecas visuais pesadas.
- **Testes:** Vitest para todas as funções de cálculo (obrigatório — seção 8).
- **Hospedagem futura:** estática (Vercel ou Netlify). Não criar backend sem decisão da coordenação.
- **Organização sugerida:**
  - `src/calculos/` — funções puras de cálculo, sem dependência de interface
  - `src/dados/` — leitura e gravação no IndexedDB
  - `src/telas/simples/` e `src/telas/completo/`
  - `src/textos/` — todos os textos da interface em um só lugar

## 5. Regras de cálculo

### 5.1 Princípio geral: separação por produto

Cada produto é calculado **separadamente**, com seus próprios dados:

| Dado do produto | Observação |
|---|---|
| Nome e unidade | kg, maço, dúzia, unidade… |
| **Período** | `mês` (produção contínua: hortaliças, ovos, mel…) ou `ciclo` (safra: mandioca, feijão…), com o **nº de meses do ciclo** (`n`). Para `mês`, `n = 1`. |
| Gastos diretos do período | Gastos que pertencem só a este produto (5.2) |
| Peso de tempo | Quanto do tempo de trabalho vai para este produto (5.4) |
| Quantidade produzida no período | |
| % que vende | Desconta consumo da família, perdas e trocas |
| Margem mínima (%) | Definida por produto |
| Preço atual praticado | O preço que o agricultor cobra hoje |

### 5.2 Gastos diretos (lançados no próprio produto, por período)

Gastos que o agricultor sabe de qual produto vieram:
- Sementes / mudas
- Adubo / esterco
- Ração / alimentação dos animais
- Embalagem específica do produto (ex.: caixa de ovos, pote de mel)
- Mão de obra contratada só para este produto
- Outros (com descrição livre)

Para produtos de `ciclo`, os gastos diretos são os **do ciclo inteiro**.

### 5.3 Gastos comuns (de toda a propriedade, por mês)

- Luz / água
- Combustível
- Transporte / frete
- Mão de obra contratada geral
- Equipamento de proteção (bota, luva, roupa de trabalho)
- **Reserva para conserto e troca de equipamentos** (5.3.2)
- **Meu trabalho** (5.3.1)
- Outros (com descrição livre)

```
Total de gastos comuns (mês) = soma dos itens acima
```

#### 5.3.1 Meu trabalho — valor único

O trabalho próprio **é custo** e entra **uma única vez**, como um só valor mensal:
`Meu trabalho = quanto preciso tirar por mês com meu trabalho`.

- **Calculadora de apoio** (opcional) para chegar a esse valor: alimentação, saúde e outras necessidades da família (descrição livre). A soma é uma **sugestão** editável — não é somada de novo aos gastos.
- Modo Completo: se o agricultor informar as horas trabalhadas no mês, mostrar o **valor da hora equivalente** = Meu trabalho ÷ horas no mês (apenas informativo, não entra no cálculo).

#### 5.3.2 Reserva para conserto e troca de equipamentos

```
Reserva mensal = soma, para cada equipamento, de (Valor pago ÷ Anos de uso ÷ 12)
```

- Modo Simples: perguntar "Você tem máquina ou equipamento? Quanto custou? Quantos anos dura?"
- Simplificação adotada: valor residual igual a zero.

### 5.4 Divisão dos gastos comuns entre os produtos

Critério: **tempo de trabalho dedicado a cada produto**.

- Modo Simples: *muito / médio / pouco* → pesos **3 / 2 / 1**
- Modo Completo: percentual informado diretamente (a soma deve dar 100%; o app avisa se não der)

```
Participação do produto = Peso do produto ÷ Soma dos pesos de todos os produtos
Gasto comum do produto (mês) = Total de gastos comuns (mês) × Participação do produto
```

Simplificação adotada: a participação é a mesma em todos os meses do ciclo.

### 5.5 Gasto total do produto no período

```
Gasto total do produto = Gastos diretos do período + Gasto comum do produto (mês) × n
```

### 5.6 Custo por unidade — base: quantidade vendida

```
Quantidade vendida = Quantidade produzida × (% que vende / 100)
Custo por unidade  = Gasto total do produto ÷ Quantidade vendida
```

- As perdas e o consumo da família são absorvidos pela parte vendida.
- Se a quantidade vendida for zero, não calcular preço: mostrar mensagem orientando o preenchimento.

### 5.7 Preço mínimo

```
Preço mínimo exato    = Custo por unidade × (1 + Margem mínima / 100)
Preço mínimo exibido  = Preço mínimo exato arredondado PARA CIMA ao próximo múltiplo de R$ 0,10
```

- É **multiplicação**, não divisão. Não substituir por markup divisor nem por margem sobre o preço de venda.
- Nunca arredondar para baixo.
- Implementação do arredondamento (evita erro de ponto flutuante): converter para centavos inteiros com arredondamento comum a 2 casas; depois arredondar para cima ao múltiplo de 10 centavos. Ex.: 1,80 exato continua **R$ 1,80**, não R$ 1,90.
- Modo Simples mostra só o exibido; Modo Completo mostra os dois.

### 5.8 Receitas

```
Receita com preço atual  = Quantidade vendida × Preço atual praticado
Receita com preço mínimo = Quantidade vendida × Preço mínimo exibido
Diferença                = Receita com preço mínimo − Receita com preço atual
```

### 5.9 Resumo do mês

- Produtos de `ciclo` entram no resumo pela **média mensal** (valor do ciclo ÷ n).
- Mostrar lado a lado: receita com preço atual × receita com preço mínimo.
- Mensagem principal:
  - Diferença > 0 → "Você está deixando de ganhar R$ X por mês"
  - Diferença ≤ 0 → "Seu preço já cobre seus gastos"
- Dois resultados, separados:
  - **Resultado considerando todos os custos** = Receita com preço atual − todos os gastos
  - **Resultado sem considerar o trabalho próprio** = Receita com preço atual − (todos os gastos − Meu trabalho)

### 5.10 Comparação por produto

Preço atual praticado está **acima** ou **abaixo** do preço mínimo exibido? Mostrar com ícone + texto + cor.

## 6. Termos obrigatórios

| Usar | Não usar |
|---|---|
| Margem mínima | Lucro mínimo, markup |
| Preço mínimo | Preço ideal, preço sugerido |
| Resultado sem considerar o trabalho próprio | Lucro real, lucro líquido |
| Meus gastos | Despesas operacionais |
| Meu trabalho / quanto preciso tirar por mês | Pró-labore |
| Gastos só deste produto | Custos diretos (no Modo Simples) |
| Gastos gerais da roça | Custos indiretos, rateio (no Modo Simples) |
| Reserva para conserto e troca | Depreciação (no Modo Simples) |
| Mês / safra | Período de apuração |

## 7. Produtos pré-cadastrados

| Produto | Período padrão |
|---|---|
| Alface, Couve, Tomate, Banana, Ovos, Frango, Mel | `mês` |
| Mandioca, Feijão | `ciclo` (nº de meses informado pelo agricultor) |

O agricultor pode adicionar, renomear, excluir produtos e trocar o período de qualquer um.

## 8. Como o Claude deve trabalhar neste projeto

- **Cálculo primeiro, tela depois.** Implementar e testar `src/calculos/` antes de qualquer interface.
- **Casos de teste obrigatórios** (conferíveis à mão):

  **Caso 1 — base vendida e arredondamento**
  Mandioca: gasto total R$ 300,00; 200 kg produzidos; vende 80% → 160 kg vendidos
  → custo por unidade **R$ 1,875**; margem 20% → preço mínimo exato **R$ 2,25**; exibido **R$ 2,30**
  → preço atual R$ 2,50 → receita com preço atual **R$ 400,00**

  **Caso 2 — divisão dos gastos comuns**
  Gastos comuns de R$ 600,00/mês; pesos: Alface 3, Ovos 2, Feijão 1
  → Alface **R$ 300,00/mês**; Ovos **R$ 200,00/mês**; Feijão **R$ 100,00/mês**

  **Caso 3 — produto de ciclo**
  Feijão (do Caso 2): ciclo de 4 meses; gastos diretos do ciclo R$ 200,00
  → gasto total = 200 + 100 × 4 = **R$ 600,00**; colheita 300 kg; vende 100%
  → custo **R$ 2,00/kg**; margem 25% → exato **R$ 2,50**; exibido **R$ 2,50** (não pode virar R$ 2,60)

  **Caso 4 — reserva de equipamentos**
  Roçadeira de R$ 2.400,00, 5 anos de uso → reserva **R$ 40,00/mês**

  **Caso 5 — arredondamento sem erro de ponto flutuante**
  Preço mínimo exato R$ 1,80 → exibido **R$ 1,80**

- **Nunca** guardar valores monetários como texto formatado; guardar como número.
- Antes de cada entrega, rodar os testes e testar a tela em largura de 360 px.
- Ao terminar uma tarefa, resumir em 2–3 linhas o que mudou.
- Em dúvida sobre regra contábil ou linguagem do agricultor: **perguntar**, não supor.

## 9. Registro de decisões

### Aprovadas pela coordenação em 18/10/2026

1. Separação por produto: gastos diretos lançados no produto; gastos comuns divididos pelo tempo de trabalho (pesos 3/2/1 ou %).
2. "Meu trabalho" é um valor único; o custo de vida vira calculadora de apoio. Equipamento de proteção passa para gastos de produção.
3. Custo por unidade calculado sobre a quantidade **vendida**.
4. Preço mínimo arredondado sempre para cima, ao múltiplo de R$ 0,10.
5. Resumo compara receita com preço atual × receita com preço mínimo.
6. Período por produto: mês ou ciclo/safra.
7. Inclusão da reserva para conserto e troca de equipamentos.

### Fora da versão 1 (fases seguintes)

- **Fluxo de caixa** (lançamentos com data).
- **Desconto do consumo da família** a preço de custo (Modo Completo).
- **Exportação anônima e com consentimento (LGPD)** para os indicadores da Meta 6. Já estruturar os dados de forma que essa exportação seja possível sem refazer o app.

### Pendências a confirmar

- Lista final de categorias de gastos diretos e comuns (5.2 e 5.3): "Ração / alimentação dos animais" foi incluída nesta revisão e não constava da planilha v2.
