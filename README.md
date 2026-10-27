# Footr

ERP especializado na gestão de lojas de camisas de futebol, desenvolvido para lojistas que vendem principalmente pelo Instagram, WhatsApp e canais próprios.

O sistema centraliza compras, estoque, vendas, PDV e financeiro, considerando as particularidades das camisas de futebol: temporadas, versões, tamanhos, conservação, personalizações, autógrafos e uso em jogo.

## Objetivo

Construir um MVP funcional que substitua planilhas e controles manuais por uma operação centralizada, rastreável e preparada para crescer.

## Funcionalidades planejadas

- Cadastro de compras unitárias e em lote.
- Rateio do custo de compras com preço total fechado.
- Entrada de camisas no estoque exclusivamente por compras confirmadas.
- Catálogo global de referências de camisas, separado do estoque de cada loja.
- Variações e características específicas por peça.
- Adição manual de camisas e identificação assistida por IA.
- Scanner com Google Gemini para sugerir dados a partir de imagens.
- Registro manual de vendas por canal.
- PDV integrado ao estoque.
- Controle financeiro de receitas, despesas e custos.
- Histórico de movimentações e rastreabilidade das peças.

## Regras fundamentais do domínio

1. Uma camisa só entra no estoque por meio de uma compra confirmada.
2. Uma compra pode conter uma peça individual ou várias peças.
3. Cada item adicionado a uma compra representa uma camisa física.
4. Um lote pode ter preço total fechado ou preço unitário por peça.
5. O custo de um lote com preço fechado deve ser rateado entre as peças segundo uma regra documentada.
6. Uma referência de camisa pode possuir várias peças com características e preços distintos.
7. O catálogo de referências deve ser independente do estoque e das vendas de cada loja.
8. A identificação por IA é uma sugestão que o usuário deve revisar antes de confirmar.
9. Movimentações de estoque e custos devem manter histórico rastreável.

## Stack planejada

- **Frontend e aplicação:** Next.js e TypeScript
- **Interface:** Tailwind CSS
- **Banco de dados:** PostgreSQL via Supabase
- **Autenticação:** Supabase Auth
- **Imagens:** armazenamento compatível com Supabase Storage
- **Validação:** Zod
- **Formulários:** React Hook Form
- **IA:** API do Google Gemini, usando um modelo com suporte a imagens e disponibilidade compatível com o projeto

A stack poderá ser ajustada por meio de Issues e decisões arquiteturais documentadas.

## Desenvolvimento

O projeto será organizado em Milestones no GitHub. Cada funcionalidade será implementada por meio de Issues com critérios de aceite verificáveis.

## Status

Em planejamento — definição dos requisitos e preparação do repositório.

## Licença

A definir antes de qualquer publicação pública do código.
