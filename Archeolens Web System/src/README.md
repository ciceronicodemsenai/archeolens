# 🏛️ ARCHEOLENS - Sistema de Gestão Arqueológica

Sistema web completo para arqueólogos gerenciarem sítios arqueológicos, artefatos e documentação de descobertas.

## 🌟 Funcionalidades

- ✅ **Autenticação de Usuários** - Sistema completo de cadastro e login
- ✅ **Gestão de Sítios Arqueológicos** - Cadastro com localização, descrição e detalhes
- ✅ **Gestão de Artefatos** - Registro de artefatos encontrados com fotos
- ✅ **Upload de Imagens** - Armazenamento de fotos dos artefatos (até 5MB)
- ✅ **Busca Avançada** - Por sítios, artefatos e arqueólogos
- ✅ **Integração Google Maps** - Visualização de localizações
- ✅ **Controle de Permissões** - Apenas criador pode editar/excluir
- ✅ **Design Responsivo** - Funciona em desktop, tablet e celular

## 🎨 Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (Edge Functions + Storage + Auth)
- **Banco de Dados**: Supabase KV Store
- **Hospedagem**: Vercel

## 🚀 Deploy Rápido na Vercel

### Passo 1: Criar conta na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Use sua conta do GitHub, GitLab ou email

### Passo 2: Fazer Upload do Projeto
1. Clique em "Add New Project"
2. Escolha "Import Git Repository" ou "Deploy from CLI"
3. Faça upload de todos os arquivos deste projeto

### Passo 3: Deploy Automático
- A Vercel detectará automaticamente o projeto React + Vite
- O build será feito automaticamente
- Você receberá um link como: `https://archeolens.vercel.app`

### Passo 4: Acessar do Celular
- Use o link fornecido pela Vercel
- Funciona em qualquer navegador (Chrome, Safari, Firefox)
- É responsivo e otimizado para mobile

## 📱 Acesso Mobile

Após o deploy, o sistema estará acessível de:
- ✅ Celulares (Android/iOS)
- ✅ Tablets
- ✅ Desktops
- ✅ Qualquer navegador moderno

## 🔐 Backend

O backend já está configurado e rodando no Supabase:
- **URL**: `https://hbnypamsxqdanuvcvvqy.supabase.co`
- **Edge Functions**: Todas as rotas estão funcionais
- **Storage**: Bucket configurado para fotos de artefatos
- **Auth**: Sistema de autenticação ativo

## 🎨 Paleta de Cores

- **Primária**: #8b5a3c (Marrom terroso)
- **Secundária**: #c19a6b (Bege/Ocre)
- **Background**: #f5f1e8 (Bege claro)
- **Texto**: #3a2f23 (Marrom escuro)

## 📝 Estrutura do Projeto

```
archeolens/
├── App.tsx                 # Componente principal
├── main.tsx               # Entry point
├── index.html             # HTML base
├── components/            # Componentes React
│   ├── AuthPage.tsx       # Autenticação
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── SitesList.tsx      # Lista de sítios
│   ├── ArtifactsList.tsx  # Lista de artefatos
│   ├── SearchPage.tsx     # Busca
│   ├── Navbar.tsx         # Navegação
│   └── ui/                # Componentes shadcn/ui
├── styles/
│   └── globals.css        # Estilos globais
├── utils/
│   └── supabase/          # Configuração Supabase
└── supabase/
    └── functions/
        └── server/        # Backend (já hospedado)
```

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📞 Suporte

Sistema desenvolvido para arqueólogos profissionais gerenciarem suas descobertas e documentações de forma eficiente e organizada.

---

**🚀 Deploy feito com sucesso? Compartilhe o link e comece a usar!**
