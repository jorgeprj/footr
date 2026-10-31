import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    ArrowUpRight01Icon,
    FileCheckIcon,
} from "@hugeicons/core-free-icons";

const columns = [
    {
        name: "team_name",
        label: "Time",
        description: "Nome do clube ao qual a camisa pertence.",
        example: "Manchester United",
    },
    {
        name: "season",
        label: "Temporada",
        description: "Temporada da camisa. Utilize o formato de sua preferência.",
        example: "2024/25",
    },
    {
        name: "type",
        label: "Tipo",
        description: "Identifica o modelo da camisa, como Home, Away ou Third.",
        example: "Home",
    },
    {
        name: "version",
        label: "Versão",
        description: "Versão da camisa, como Player ou Fan.",
        example: "Player",
    },
    {
        name: "size",
        label: "Tamanho",
        description: "Tamanho da peça.",
        example: "M",
    },
    {
        name: "cost_price",
        label: "Preço de custo",
        description: "Quanto sua loja pagou pela camisa.",
        example: "80.00",
    },
    {
        name: "sale_price",
        label: "Preço de venda",
        description: "Valor pelo qual a camisa será anunciada na loja.",
        example: "149.90",
    },
];

const csvExample = `team_name,season,type,version,size,cost_price,sale_price
Manchester United,2024/25,Home,Player,M,80.00,149.90
Real Madrid,2023/24,Away,Fan,G,65.00,129.90
Barcelona,2022/23,Third,Player,L,90.00,179.90`;

const jsonExample = `[
  {
    "team_name": "Manchester United",
    "season": "2024/25",
    "type": "Home",
    "version": "Player",
    "size": "M",
    "cost_price": 80.00,
    "sale_price": 149.90
  },
  {
    "team_name": "Real Madrid",
    "season": "2023/24",
    "type": "Away",
    "version": "Fan",
    "size": "G",
    "cost_price": 65.00,
    "sale_price": 129.90
  }
]`;

function SectionTitle({
    number,
    children,
}: {
    number: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-6 flex items-center gap-4">
            <span className="text-xs font-medium tabular-nums text-zinc-400">
                {number}
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                {children}
            </h2>
        </div>
    );
}

function CodeExample({
    label,
    code,
}: {
    label: string;
    code: string;
}) {
    return (
        <div className="overflow-hidden rounded-xl bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <span className="text-xs font-medium text-zinc-300">
                    {label}
                </span>
                <span className="text-xs text-zinc-500">
                    Exemplo
                </span>
            </div>

            <pre className="overflow-x-auto p-5 text-xs leading-6 text-zinc-200 sm:text-sm">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function ProductImportGuidePage() {
    return (
        <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
            <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-950"
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                Voltar para produtos
            </Link>

            <header className="mt-12 border-b border-zinc-200 pb-10">
                <div className="mb-5 flex items-center gap-2">
                    <HugeiconsIcon
                        icon={FileCheckIcon}
                        size={17}
                        className="text-zinc-500"
                    />
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Central de ajuda / Produtos
                    </span>
                </div>

                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                    Como importar produtos automaticamente
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-500">
                    Cadastre várias camisas de uma só vez usando uma planilha
                    ou arquivo de dados. Neste guia, você aprende a preparar
                    seu arquivo e importar seu estoque para a Footr.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href="/products"
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                    >
                        Ir para produtos
                        <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            size={16}
                        />
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-12 py-12 sm:grid-cols-[180px_minmax(0,1fr)]">
                <aside className="hidden sm:block">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Neste guia
                    </p>

                    <nav className="sticky top-8 space-y-3 text-sm text-zinc-500">
                        <a href="#como-funciona" className="block hover:text-zinc-950">
                            Como funciona
                        </a>
                        <a href="#formatos" className="block hover:text-zinc-950">
                            Formatos aceitos
                        </a>
                        <a href="#colunas" className="block hover:text-zinc-950">
                            Colunas da planilha
                        </a>
                        <a href="#csv" className="block hover:text-zinc-950">
                            Exemplo CSV
                        </a>
                        <a href="#json" className="block hover:text-zinc-950">
                            Exemplo JSON
                        </a>
                        <a href="#cuidados" className="block hover:text-zinc-950">
                            Cuidados importantes
                        </a>
                    </nav>
                </aside>

                <div className="min-w-0 space-y-14">
                    <section id="como-funciona" className="scroll-mt-8">
                        <SectionTitle number="01">
                            Como funciona a importação
                        </SectionTitle>

                        <p className="mb-6 text-sm leading-7 text-zinc-600">
                            A importação permite cadastrar várias camisas sem
                            precisar preencher o formulário de cada produto
                            individualmente. Cada linha da sua planilha
                            representa uma peça física do estoque.
                        </p>

                        <div className="space-y-5">
                            {[
                                {
                                    number: "01",
                                    title: "Prepare seu arquivo",
                                    description:
                                        "Baixe o modelo da Footr ou organize seus dados seguindo as colunas obrigatórias.",
                                },
                                {
                                    number: "02",
                                    title: "Envie o arquivo",
                                    description:
                                        "Acesse Produtos, encontre a área de importação e selecione seu arquivo ou arraste-o até a área indicada.",
                                },
                                {
                                    number: "03",
                                    title: "Confira os dados",
                                    description:
                                        "A Footr apresenta uma prévia dos produtos, indicando quais linhas estão válidas e quais precisam de correção.",
                                },
                                {
                                    number: "04",
                                    title: "Confirme a importação",
                                    description:
                                        "Depois de revisar os dados, confirme para cadastrar os produtos no estoque da sua loja.",
                                },
                            ].map((step) => (
                                <div
                                    key={step.number}
                                    className="flex gap-4"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                                        {step.number}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-950">
                                            {step.title}
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="formatos" className="scroll-mt-8">
                        <SectionTitle number="02">
                            Formatos aceitos
                        </SectionTitle>

                        <p className="mb-6 text-sm leading-7 text-zinc-600">
                            Você pode enviar arquivos nos seguintes formatos:
                        </p>

                        <div className="divide-y divide-zinc-100">
                            {[
                                {
                                    extension: ".xlsx",
                                    title: "Excel",
                                    description:
                                        "Recomendado. Você pode editar o modelo diretamente no Excel ou Google Sheets e exportar como XLSX.",
                                },
                                {
                                    extension: ".csv",
                                    title: "Valores separados por vírgula",
                                    description:
                                        "Arquivo de texto com uma linha de cabeçalho e uma linha para cada produto.",
                                },
                                {
                                    extension: ".json",
                                    title: "JavaScript Object Notation",
                                    description:
                                        "Formato estruturado, indicado para quem gera os dados por sistemas ou processos automatizados.",
                                },
                            ].map((format) => (
                                <div
                                    key={format.extension}
                                    className="flex gap-4 py-4"
                                >
                                    <span className="w-14 shrink-0 pt-0.5 text-xs font-semibold text-zinc-500">
                                        {format.extension}
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-950">
                                            {format.title}
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                                            {format.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-5 text-xs leading-5 text-zinc-400">
                            Tamanho máximo do arquivo: 10 MB.
                        </p>
                    </section>

                    <section id="colunas" className="scroll-mt-8">
                        <SectionTitle number="03">
                            Entenda cada coluna
                        </SectionTitle>

                        <p className="mb-6 text-sm leading-7 text-zinc-600">
                            Todos os arquivos precisam conter os sete campos
                            abaixo. Os nomes devem ser escritos exatamente
                            como aparecem nesta tabela.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-140 text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200 text-xs text-zinc-400">
                                        <th className="pb-3 pr-4 font-medium">
                                            Coluna
                                        </th>
                                        <th className="pb-3 pr-4 font-medium">
                                            Significado
                                        </th>
                                        <th className="pb-3 font-medium">
                                            Exemplo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {columns.map((column) => (
                                        <tr
                                            key={column.name}
                                            className="border-b border-zinc-100 align-top"
                                        >
                                            <td className="py-4 pr-4">
                                                <code className="text-xs font-semibold text-zinc-900">
                                                    {column.name}
                                                </code>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <p className="text-sm font-medium text-zinc-800">
                                                    {column.label}
                                                </p>
                                                <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">
                                                    {column.description}
                                                </p>
                                            </td>
                                            <td className="py-4 text-xs text-zinc-600">
                                                {column.example}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 rounded-lg bg-zinc-50 p-4">
                            <p className="text-sm font-medium text-zinc-900">
                                Uma linha representa uma camisa
                            </p>
                            <p className="mt-1 text-sm leading-6 text-zinc-500">
                                Mesmo que você tenha várias unidades do mesmo
                                modelo, cada peça deve ocupar uma linha
                                independente. A Footr gera um código único
                                para cada produto importado.
                            </p>
                        </div>
                    </section>

                    <section id="csv" className="scroll-mt-8">
                        <SectionTitle number="04">
                            Como preencher um CSV
                        </SectionTitle>

                        <p className="mb-5 text-sm leading-7 text-zinc-600">
                            O CSV organiza os dados em colunas separadas por
                            vírgulas. A primeira linha deve conter os nomes
                            dos campos. Cada linha seguinte representa um
                            produto.
                        </p>

                        <CodeExample
                            label="produtos.csv"
                            code={csvExample}
                        />

                        <p className="mt-4 text-sm leading-6 text-zinc-500">
                            Você pode montar esse arquivo em um editor de
                            planilhas e exportá-lo como CSV. Ao salvar,
                            prefira a codificação UTF-8 para preservar
                            acentos e caracteres especiais.
                        </p>
                    </section>

                    <section id="json" className="scroll-mt-8">
                        <SectionTitle number="05">
                            Como preencher um JSON
                        </SectionTitle>

                        <p className="mb-5 text-sm leading-7 text-zinc-600">
                            JSON é uma alternativa para quem gera arquivos
                            automaticamente. Os produtos devem ser
                            representados como objetos dentro de uma lista.
                            Cada objeto contém os mesmos sete campos da
                            planilha.
                        </p>

                        <CodeExample
                            label="produtos.json"
                            code={jsonExample}
                        />

                        <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-500">
                            <p>
                                <strong className="text-zinc-800">Atenção:</strong>{" "}
                                os nomes dos campos devem ficar entre aspas
                                duplas. Textos também usam aspas duplas.
                            </p>
                            <p>
                                Os preços devem ser números, sem símbolo de
                                moeda. Utilize ponto para separar as casas
                                decimais, como <code>149.90</code>.
                            </p>
                            <p>
                                Não coloque vírgula depois do último campo
                                de um objeto.
                            </p>
                        </div>
                    </section>

                    <section id="cuidados" className="scroll-mt-8">
                        <SectionTitle number="06">
                            Cuidados antes de importar
                        </SectionTitle>

                        <div className="space-y-4">
                            {[
                                "Não altere os nomes das colunas. Utilize exatamente os campos indicados neste guia.",
                                "Preencha todos os sete campos de cada produto.",
                                "Os preços devem ser números positivos ou zero, com no máximo duas casas decimais.",
                                "Não inclua R$, símbolos ou texto nos campos de preço.",
                                "Não mescle células nem utilize títulos extras antes do cabeçalho no Excel.",
                                "Confira se cada linha representa apenas uma camisa.",
                                "Revise a prévia da Footr antes de confirmar a importação.",
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-3"
                                >
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                                    <p className="text-sm leading-6 text-zinc-600">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="border-t border-zinc-200 pt-10">
                        <div className="rounded-xl bg-zinc-950 p-6 sm:p-8">
                            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                                Pronto para começar?
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                Seu estoque, organizado em poucos minutos.
                            </h2>

                            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">
                                Prepare sua planilha, envie o arquivo e
                                deixe a Footr cuidar do cadastro dos produtos.
                            </p>

                            <Link
                                href="/products"
                                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
                            >
                                Ir para importação
                                <HugeiconsIcon
                                    icon={ArrowUpRight01Icon}
                                    size={16}
                                />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>

            <footer className="border-t border-zinc-200 pt-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <p className="text-sm font-semibold text-zinc-900">
                        Footr
                    </p>
                    <p className="text-xs text-zinc-400">
                        Central de ajuda · Alfa 0.1
                    </p>
                </div>
            </footer>
        </main>
    );
}
