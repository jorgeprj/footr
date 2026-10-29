# Footr — Arquitetura de Software

**Status:** Decisão adotada  
**Escopo:** MVP 0.1 e evolução da plataforma  
**Stack inicial:** Next.js, TypeScript, Tailwind CSS e Supabase

## 1. Objetivo

Este documento define os princípios, a estrutura de pastas e as regras de desenvolvimento da Footr.

A arquitetura deve permitir desenvolver o MVP rapidamente sem comprometer a evolução do produto. A Footr começa como um PDV simples para lojas de camisas de futebol, especialmente para uso em eventos, mas poderá evoluir para um ERP, um e-commerce, um catálogo global de camisas e uma plataforma de inteligência de mercado.

Para isso, adotaremos uma combinação de **Feature-Sliced Design (FSD)** e **Arquitetura Hexagonal**.

O FSD organizará a aplicação por responsabilidades e funcionalidades. A Arquitetura Hexagonal manterá as regras de negócio independentes do banco de dados, do framework e de serviços externos.

Não construiremos antecipadamente toda a infraestrutura necessária para os produtos futuros. Implementaremos somente o que o MVP exige, preservando fronteiras claras para permitir a expansão.

## 2. Princípios arquiteturais

### 2.1. Organização por funcionalidades

O código deve ser organizado de acordo com as responsabilidades do produto, evitando uma estrutura composta apenas por pastas genéricas como `components`, `services` e `utils`.

Cada funcionalidade deve ter uma responsabilidade clara e expor uma interface pública para o restante da aplicação.

### 2.2. Independência das regras de negócio

As regras centrais de vendas, produtos e estoque não devem depender diretamente de Next.js, React, Supabase ou de qualquer fornecedor externo.

A lógica de negócio deve poder ser executada e testada sem precisar iniciar a interface ou conectar-se ao banco de dados.

### 2.3. Dependências explícitas

Os módulos não devem acessar diretamente os detalhes internos de outros módulos.

Quando uma funcionalidade precisar utilizar outra, deverá fazê-lo por meio de uma interface pública, de um caso de uso ou de um contrato definido.

### 2.4. Simplicidade proporcional ao produto

Não criaremos abstrações sem necessidade concreta.

O MVP utilizará uma única aplicação Next.js, um único projeto e uma única implantação. Não adotaremos microserviços ou separação em múltiplas aplicações enquanto não houver uma necessidade real.

### 2.5. Evolução sem reescrita desnecessária

As fronteiras entre domínio, aplicação e infraestrutura devem permitir substituir tecnologias ou adicionar integrações com o mínimo possível de alterações nas regras de negócio.

Uma mudança de banco de dados ainda poderá exigir migração de dados, revisão de consultas e testes de compatibilidade. O objetivo é evitar que essas mudanças obriguem a reescrever a lógica central do produto.

## 3. O que é Feature-Sliced Design (FSD)?

Feature-Sliced Design é uma metodologia de organização de aplicações frontend baseada em camadas, domínios e funcionalidades.

Em vez de concentrar todos os componentes em uma pasta global, o FSD procura manter juntos os elementos que pertencem à mesma responsabilidade e define regras para as dependências entre as camadas.

Neste projeto, adotaremos os princípios do FSD, com uma adaptação na nomenclatura para evitar conflito entre a camada `pages` do FSD e o sistema de rotas do Next.js.

As rotas reais ficarão em `src/app/`. A composição das telas ficará em `src/views/`.

As principais camadas serão:

- **App:** configuração da aplicação, layouts globais e rotas do Next.js.
- **Views:** composição das telas da aplicação.
- **Widgets:** blocos de interface compostos e reutilizáveis.
- **Features:** ações e capacidades com as quais o usuário interage.
- **Entities:** conceitos de negócio utilizados pela interface.
- **Shared:** componentes genéricos e recursos técnicos compartilhados.

A direção de dependência preferencial será:

`App → Views → Widgets → Features → Entities → Shared`

Uma camada superior pode utilizar as inferiores. Uma camada inferior não deve importar uma camada superior.

As dependências entre módulos da mesma camada devem ser evitadas ou controladas por interfaces públicas, de acordo com a necessidade.

Essa estrutura é uma adaptação pragmática do FSD, não uma implementação literal de todas as convenções oficiais.

## 4. O que é Arquitetura Hexagonal?

A Arquitetura Hexagonal, também conhecida como Ports and Adapters, é uma forma de organizar o software para que as regras de negócio permaneçam independentes dos detalhes técnicos necessários para executá-las.

O nome "hexagonal" é uma representação conceitual. Não significa que o sistema precise ter exatamente seis módulos ou seis interfaces.

A arquitetura possui três elementos principais.

### 4.1. Domain — domínio

Contém as regras e os conceitos fundamentais do negócio.

Exemplos na Footr:

- O que representa uma venda.
- Como o preço e a quantidade determinam o subtotal.
- Quais condições tornam uma venda válida.
- Como representar um produto e suas variantes.

O domínio não deve importar React, Next.js, Supabase ou bibliotecas específicas de infraestrutura.

### 4.2. Application — aplicação

Contém os casos de uso que coordenam as operações do sistema.

Exemplos:

- Registrar uma venda.
- Consultar o histórico de vendas.
- Criar um produto.
- Atualizar o estoque após uma venda.

Um caso de uso coordena a execução da regra de negócio e utiliza contratos para acessar recursos externos. Ele não precisa conhecer a implementação concreta desses recursos.

### 4.3. Ports and Adapters — portas e adaptadores

Uma **porta** é um contrato que define como uma parte do sistema interage com outra.

Um **adaptador** é uma implementação concreta desse contrato.

Exemplo:

- Porta: `SaleRepository`, responsável por definir como salvar e consultar vendas.
- Adaptador: `SupabaseSaleRepository`, que implementa esse contrato utilizando Supabase.

A lógica de negócio depende da porta, e não do adaptador.

Isso permite substituir o adaptador por uma implementação baseada em outro banco de dados sem precisar alterar as regras de negócio que utilizam o contrato.

A interface é o contrato; o adaptador é a implementação técnica.

## 5. Estrutura de pastas

A estrutura inicial será:

```text
footr-retail-erp/
├── docs/
│   └── architecture.md
├── public/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── pos/
│   │   │   ├── sales/
│   │   │   └── finance/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── views/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── pos/
│   │   ├── sales/
│   │   └── finance/
│   │
│   ├── widgets/
│   │
│   ├── features/
│   │   ├── checkout/
│   │   ├── scan-product/
│   │   ├── import-products/
│   │   └── print-labels/
│   │
│   ├── entities/
│   │   ├── product/
│   │   ├── sale/
│   │   ├── inventory/
│   │   └── store/
│   │
│   ├── modules/
│   │   ├── sales/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── ports/
│   │   │   └── adapters/
│   │   ├── products/
│   │   └── inventory/
│   │
│   └── shared/
│       ├── ui/
│       ├── lib/
│       ├── config/
│       └── types/
│
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tsconfig.json
└── ...
```

Os arquivos de configuração e os nomes exatos podem variar conforme a versão do Next.js gerada pelo instalador.

### Responsabilidade de cada pasta

**`src/app/`**

Contém as rotas e os layouts do Next.js. As páginas devem ser finas: sua responsabilidade é conectar a rota à tela correspondente, sem concentrar regras de negócio.

**`src/views/`**

Contém a composição das telas completas, como a tela de PDV. Reúne widgets e funcionalidades necessários para apresentar uma página.

**`src/widgets/`**

Contém blocos maiores de interface que podem ser reutilizados em diferentes telas, como uma navegação lateral ou um resumo de vendas.

**`src/features/`**

Contém ações e interações do usuário, como finalizar uma venda, ler um código ou importar produtos. Uma feature pode chamar um caso de uso do módulo de negócio correspondente.

**`src/entities/`**

Contém conceitos e recursos reutilizáveis de apresentação relacionados às entidades do negócio, como produtos e vendas.

Essa camada não deve se tornar um segundo local para implementar as regras centrais do domínio. Essas regras pertencem a `src/modules/`.

**`src/modules/`**

Contém os módulos de negócio organizados segundo a Arquitetura Hexagonal.

Cada módulo é responsável por suas regras, casos de uso, contratos e adaptadores. A implementação inicial deve conter apenas as pastas e os arquivos necessários à funcionalidade em desenvolvimento.

**`src/shared/`**

Contém recursos genéricos que não pertencem exclusivamente a uma funcionalidade, como componentes de interface básicos, utilitários e configurações compartilhadas.

**`docs/`**

Contém decisões e documentação técnica que ajudam desenvolvedores e agentes de IA a entender como o projeto deve evoluir.

## 6. Exemplo prático: registrar uma venda no MVP 0.1

O fluxo de finalização de venda será o exemplo de referência para a aplicação da arquitetura.

No MVP 0.1, o lojista deverá conseguir selecionar produtos, conferir o carrinho, informar a forma de pagamento e finalizar a venda.

### 6.1. Fluxo da operação

1. O lojista adiciona produtos ao carrinho na tela do PDV.
2. A feature `checkout` envia os dados da operação para o caso de uso `RegisterSale`.
3. O caso de uso valida a operação e coordena as regras de venda.
4. O caso de uso utiliza a porta `SaleRepository` para persistir a venda.
5. O adaptador `SupabaseSaleRepository` grava os dados no banco.
6. A aplicação informa o resultado ao lojista e atualiza a interface.

O fluxo conceitual é:

```text
PDV / Next.js
      |
      v
Feature: Checkout
      |
      v
Use case: RegisterSale
      |
      +----> Domain: regras da venda
      |
      v
Port: SaleRepository
      |
      v
Adapter: SupabaseSaleRepository
      |
      v
Banco de dados
```

A interface não deve gravar diretamente na tabela de vendas. O caso de uso não deve importar o cliente Supabase. O adaptador é o único responsável por traduzir o contrato de persistência para a tecnologia utilizada.

### 6.2. Organização dos arquivos

```text
src/
├── features/
│   └── checkout/
│       ├── ui/
│       │   └── checkout-form.tsx
│       └── index.ts
│
├── entities/
│   └── sale/
│       ├── model/
│       ├── ui/
│       └── index.ts
│
└── modules/
    └── sales/
        ├── domain/
        │   ├── sale.ts
        │   └── sale-rules.ts
        ├── application/
        │   └── register-sale.ts
        ├── ports/
        │   └── sale-repository.ts
        ├── adapters/
        │   └── supabase-sale-repository.ts
        └── index.ts
```

Essa árvore é ilustrativa. Arquivos como `sale-rules.ts` só devem ser criados quando houver regras que justifiquem sua separação.

### 6.3. Exemplo de porta

```ts
// modules/sales/ports/sale-repository.ts

import type { Sale } from "../domain/sale";

export interface SaleRepository {
  save(sale: Sale): Promise<void>;
}
```

A porta define a operação necessária sem determinar como os dados serão gravados.

### 6.4. Exemplo de caso de uso

```ts
// modules/sales/application/register-sale.ts

import type { SaleRepository } from "../ports/sale-repository";
import type { Sale } from "../domain/sale";

export class RegisterSale {
  constructor(
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(sale: Sale): Promise<void> {
    // Aplicar ou invocar as regras de negócio da venda.
    // Persistir somente uma venda válida.
    await this.saleRepository.save(sale);
  }
}
```

Esse código ilustra a dependência por contrato, não a implementação completa do checkout. Antes de utilizá-lo em produção, será necessário definir a validação do domínio, a identidade da venda, o cálculo dos valores e as condições de persistência.

O caso de uso recebe sua dependência externamente. Esse padrão é chamado de injeção de dependência.

### 6.5. Onde fica o Supabase?

A implementação Supabase fica em `modules/sales/adapters/`.

O adaptador deve implementar `SaleRepository` e converter os dados do domínio para o formato de persistência.

O cliente Supabase com credenciais privilegiadas deve permanecer exclusivamente no servidor. A aplicação deve validar os dados e autorizar o acesso antes de executar operações de persistência.

Para vendas que alteram simultaneamente a venda e o estoque, a operação precisa garantir consistência transacional. Se forem necessárias várias gravações, a coordenação deve ser feita de forma atômica no banco ou em uma operação de servidor apropriada. Não devemos tratar duas gravações independentes como se fossem uma transação.

## 7. Como essa funcionalidade evolui no futuro?

### Cenário A — Trocar o banco de dados

No MVP, utilizaremos Supabase.

Se futuramente decidirmos utilizar outro banco, criaremos um novo adaptador que implemente `SaleRepository`.

O caso de uso `RegisterSale` continuará dependendo da mesma porta, desde que o novo adaptador respeite o contrato e as garantias exigidas.

A migração ainda exigirá transferir dados, validar consultas, preservar integridade e testar o comportamento. A vantagem é não precisar reescrever toda a lógica de vendas.

### Cenário B — Adicionar um e-commerce

No futuro, a Footr poderá ter uma loja virtual que compartilhe catálogo, disponibilidade de estoque e informações comerciais com o ERP.

O e-commerce não deverá acessar diretamente as tabelas internas do PDV nem copiar suas regras de venda.

A integração deverá utilizar contratos e casos de uso definidos, por exemplo, para consultar produtos, verificar disponibilidade e registrar pedidos.

Se o e-commerce estiver na mesma aplicação, poderá utilizar os módulos internos por suas interfaces públicas. Se for uma aplicação independente, deverá consumir uma API autenticada ou outro contrato de integração explicitamente definido.

Não será necessário separar o ERP em um serviço independente antes de existir essa necessidade.

### Cenário C — Construir um catálogo global de camisas

O catálogo global exigirá distinguir três conceitos:

- **Catalog item:** a identidade da camisa, incluindo atributos como time, temporada e versão.
- **Inventory item:** a unidade ou variante controlada por uma loja.
- **Sale:** o registro de uma transação comercial.

Esses conceitos não devem ser confundidos. Uma camisa pode existir no catálogo global sem estar disponível para venda, e uma loja pode possuir diversas unidades de um mesmo modelo.

O módulo de catálogo poderá evoluir de forma independente da operação do PDV, mantendo contratos de integração com produtos, estoque e vendas quando necessário.

A base de dados de vendas também não deve ser considerada automaticamente uma referência universal de preços. Será necessário definir a qualidade, a origem, a atualização e a comparabilidade dos dados antes de apresentar estimativas ou históricos públicos.

## 8. Regras obrigatórias para desenvolvimento

Desenvolvedores e agentes de IA devem respeitar as seguintes regras:

1. Não implementar regras centrais de negócio diretamente em componentes React ou páginas do Next.js.
2. Não importar o cliente Supabase diretamente de uma feature ou de um componente de interface.
3. Não permitir que o domínio importe bibliotecas de infraestrutura, UI ou framework.
4. Não acessar diretamente os arquivos internos de outro módulo. Utilizar suas interfaces públicas.
5. Não duplicar regras de negócio entre PDV, relatórios e integrações.
6. Manter o acesso a dados e os segredos no servidor.
7. Validar e autorizar operações no servidor; não confiar apenas nas validações da interface.
8. Preservar o isolamento entre lojas em consultas, operações de escrita e políticas de acesso.
9. Testar as regras do domínio sem depender de banco de dados ou navegador.
10. Criar adaptadores e abstrações apenas quando necessários para cumprir uma fronteira arquitetural concreta.
11. Manter os contratos estáveis e revisar suas alterações quando houver impacto em outros módulos.
12. Atualizar esta documentação quando uma decisão estrutural relevante mudar.

## 9. Estratégia de testes

A estratégia de testes deve acompanhar a separação arquitetural.

**Domain:** testes unitários para regras, cálculos e validações.

**Application:** testes dos casos de uso utilizando implementações falsas das portas, sem conectar-se ao banco.

**Adapters:** testes de integração para verificar a compatibilidade com o banco e os serviços externos.

**Interface:** testes das interações importantes do usuário, incluindo o fluxo de finalização de uma venda.

**Integração completa:** testes dos fluxos críticos que envolvem persistência e consistência do estoque.

Não é necessário criar toda a infraestrutura de testes no primeiro commit, mas as regras centrais devem nascer com uma estrutura que permita testá-las isoladamente.

## 10. Escopo da arquitetura no MVP 0.1

A arquitetura não deve ampliar o escopo funcional do MVP.

A primeira entrega deve concentrar-se no PDV para eventos, com cadastro ou importação de produtos, identificação por códigos, carrinho, finalização de vendas e histórico, além da atualização consistente do estoque.

A estrutura das cinco telas — Dashboard, Products, POS, Sales e Finance — será preparada, mas cada tela poderá evoluir de acordo com as prioridades do produto.

Não fazem parte da implementação obrigatória inicial:

- Microserviços.
- API pública para terceiros.
- E-commerce independente.
- Catálogo global completo.
- Plataforma de inteligência de preços.
- Suporte a múltiplos bancos em produção.
- Sistema genérico de plugins ou integração.

Essas evoluções devem ser possíveis por meio de módulos e contratos bem definidos, sem serem implementadas antecipadamente.

## 11. Critério de decisão

A arquitetura será considerada bem aplicada quando uma nova funcionalidade puder ser desenvolvida dentro de sua responsabilidade, sem espalhar regras de negócio pela aplicação; quando as regras centrais puderem ser testadas isoladamente; e quando mudanças em serviços externos puderem ser tratadas principalmente nos adaptadores correspondentes.

A prioridade é construir uma base simples, consistente e evolutiva.

**Decisão final:** utilizar princípios de Feature-Sliced Design para organizar o frontend e Arquitetura Hexagonal para os módulos de negócio, mantendo inicialmente um único projeto Next.js e implementando apenas as abstrações necessárias ao MVP.