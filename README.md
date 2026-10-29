# Requisitos Funcionais — Footr

## 1. Introdução

Este documento define os requisitos funcionais da Footr, um SaaS de gestão para lojistas de camisas de futebol. O objetivo do MVP é permitir o controle básico de produtos e estoque, a identificação de peças por códigos, a realização de vendas em um ponto de venda (PDV) e a geração de relatórios financeiros.

Cada requisito está associado à issue correspondente no GitHub, permitindo rastreabilidade entre os requisitos do sistema e as atividades de desenvolvimento.

## 2. Requisitos Funcionais

### RF-01 — Autenticação de usuários (Issue #4)

O sistema deve permitir que usuários autenticados acessem as funcionalidades internas da aplicação.

- O usuário deve conseguir entrar e sair do sistema.
- O sistema deve restringir o acesso às páginas internas a usuários autenticados.

### RF-02 — Cadastro e importação de produtos (Issue #5)

O sistema deve permitir cadastrar camisas de futebol manualmente ou por meio da importação de arquivos CSV e Excel.

Cada produto deve conter, no mínimo:

- Nome do time;
- Temporada;
- Versão da camisa;
- Tamanho;
- Preço de custo;
- Preço de venda.

O sistema deve validar os campos obrigatórios e os valores informados, identificar registros inválidos e disponibilizar os produtos importados para consulta e venda.

### RF-03 — Geração de código único Footr (Issue #6)

O sistema deve gerar automaticamente um código único de identificação para cada unidade física controlada individualmente ou registro de produto, conforme o modelo de estoque adotado.

- O código deve ser exclusivo e persistente.
- O código deve permitir localizar o produto no sistema.
- O sistema deve impedir a duplicidade de códigos.

### RF-04 — Geração e impressão de etiquetas (Issue #7)

O sistema deve permitir gerar e imprimir etiquetas de identificação para os produtos cadastrados.

- Cada etiqueta deve conter um QR Code ou código de barras associado ao código Footr.
- A etiqueta deve apresentar informações básicas para identificação da camisa.
- Os códigos devem ser legíveis por dispositivos compatíveis.

### RF-05 — Busca e identificação de produtos (Issue #8)

O sistema deve permitir localizar e identificar produtos para consulta e inclusão no PDV.

A identificação deve ser possível por meio de:

- Busca pelo nome do time ou informações do produto;
- Digitação do código Footr;
- Leitura de QR Code pela câmera de um dispositivo compatível;
- Leitura de código de barras por um leitor compatível.

O sistema deve apresentar os dados do produto identificado e informar quando não houver correspondência.

### RF-06 — Registro e finalização de vendas no PDV (Issue #9)

O sistema deve disponibilizar um ponto de venda para registrar e finalizar compras.

- O usuário deve conseguir adicionar, remover e alterar quantidades de produtos no carrinho.
- O sistema deve calcular automaticamente os valores da venda.
- O usuário deve conseguir informar o nome do cliente, quando aplicável.
- O sistema deve permitir registrar as seguintes formas de pagamento: Pix, dinheiro, débito, crédito à vista e crédito parcelado.
- O sistema deve validar a disponibilidade de estoque antes de confirmar a venda.
- Após a confirmação, a venda deve ser registrada com seus itens, valores e pagamentos.

### RF-07 — Histórico de vendas e controle de estoque (Issue #10)

O sistema deve manter o histórico das vendas realizadas e atualizar o estoque de acordo com as operações confirmadas.

- O histórico deve apresentar data, identificador da venda, cliente, valor total e forma de pagamento.
- O usuário deve conseguir consultar os detalhes de uma venda e seus respectivos itens.
- O sistema deve reduzir o estoque após a confirmação de uma venda.
- O sistema deve impedir vendas que excedam a quantidade disponível em estoque.
- O sistema deve preservar os preços e custos aplicáveis no momento da venda.

### RF-08 — Configuração de taxas e relatórios financeiros (Issue #11)

O sistema deve permitir configurar taxas percentuais por forma de pagamento e gerar relatórios financeiros com base nas vendas registradas.

- O usuário deve conseguir configurar taxas para as modalidades de pagamento disponíveis.
- O usuário deve conseguir selecionar um período e solicitar a geração do relatório.
- O relatório deve apresentar quantidade de vendas, receita bruta, taxas estimadas e receita líquida.
- O relatório deve apresentar o custo dos produtos vendidos e o lucro bruto estimado.
- O sistema deve calcular as taxas conforme a modalidade e a configuração aplicável a cada pagamento.

### RF-09 — Dashboard de indicadores (Issue #12)

O sistema deve disponibilizar um dashboard com indicadores operacionais e financeiros da loja.

O dashboard deve apresentar:

- Total de vendas no período selecionado;
- Quantidade de vendas;
- Ticket médio;
- Produtos com estoque baixo;
- Produtos mais vendidos no período.

Os indicadores devem ser calculados com base nos dados registrados no sistema.

## 3. Rastreabilidade

| Requisito | Issue do GitHub | Funcionalidade |
|---|---:|---|
| RF-01 | #4 | Autenticação |
| RF-02 | #5 | Cadastro e importação |
| RF-03 | #6 | Código único Footr |
| RF-04 | #7 | Etiquetas e códigos |
| RF-05 | #8 | Busca e identificação |
| RF-06 | #9 | PDV e finalização de vendas |
| RF-07 | #10 | Histórico e estoque |
| RF-08 | #11 | Financeiro e relatórios |
| RF-09 | #12 | Dashboard |

## 4. Escopo do MVP

Os requisitos descritos neste documento representam as funcionalidades previstas para a primeira versão da Footr. Funcionalidades adicionais, como integrações com gateways de pagamento, identificação de camisas por inteligência artificial, inteligência de mercado e gestão avançada de compras, não fazem parte do escopo funcional inicial.
