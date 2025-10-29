# 🌍 ARCHEOLENS - Sistema Público

## ✅ Sistema já está ONLINE e PÚBLICO!

O sistema **ARCHEOLENS** está completamente configurado e acessível publicamente através do Figma Make.

---

## 🔗 Como Acessar

O sistema está rodando em:
- **URL Base do Backend**: `https://hbnypamsxqdanuvcvvqy.supabase.co/functions/v1/make-server-9e6b04bc/`
- **Project ID**: `hbnypamsxqdanuvcvvqy`

### Para Usuários Finais:
1. Acesse o sistema através do **Figma Make** (ambiente de desenvolvimento)
2. Qualquer pessoa pode criar uma conta
3. Após login, todas as funcionalidades estarão disponíveis

---

## 📸 Visualização de Imagens nos Artefatos

### ✅ O que foi implementado:

1. **Upload de Fotos**
   - Máximo 5MB por foto
   - Formatos aceitos: JPG, PNG, GIF
   - Armazenamento no Supabase Storage

2. **Exibição de Imagens**
   - ✅ Imagem de preview no topo de cada card de artefato
   - ✅ Descrição do artefato exibida abaixo da imagem
   - ✅ Preview em tempo real ao fazer upload no formulário
   - ✅ Imagens responsivas e otimizadas

3. **Onde as Imagens Aparecem**
   - Na lista de artefatos (página "Artefatos")
   - No formulário de cadastro/edição (preview)
   - Cards com imagens têm altura fixa de 192px (h-48)

---

## 🎨 Recursos do Sistema

### Funcionalidades Públicas (sem login):
- ❌ Nenhuma (autenticação obrigatória)

### Funcionalidades Autenticadas:
- ✅ Cadastro de usuários (arqueólogos)
- ✅ Cadastro de sítios arqueológicos
- ✅ Cadastro de artefatos com fotos
- ✅ Upload de imagens (até 5MB)
- ✅ Busca por sítios (nome/estado/cidade)
- ✅ Busca por artefatos
- ✅ Busca por arqueólogos
- ✅ Visualização no Google Maps
- ✅ Controle de permissões (só quem criou pode editar/excluir)

---

## 🔐 Segurança

✅ **Service Role Key**: Protegida no backend (nunca exposta)  
✅ **Anon Key**: Pública (segura para uso no frontend)  
✅ **Autenticação**: Supabase Auth  
✅ **Autorização**: Apenas criador pode editar/excluir  
✅ **Storage**: Bucket privado com URLs assinadas (válidas por 1 ano)  

---

## 📊 Estrutura de Dados

### Artefatos:
```json
{
  "id": "uuid",
  "name": "Nome do artefato",
  "archaeologist": "Nome do arqueólogo",
  "location": "Coordenadas ou endereço",
  "siteId": "ID do sítio",
  "description": "Descrição detalhada",
  "photoUrl": "URL assinada do Supabase Storage",
  "createdBy": "userId",
  "createdAt": "timestamp"
}
```

### Sítios Arqueológicos:
```json
{
  "id": "uuid",
  "name": "Nome do sítio",
  "description": "Descrição",
  "location": "Localização",
  "highlight": "Destaque",
  "state": "Estado",
  "city": "Cidade",
  "createdBy": "userId",
  "createdAt": "timestamp"
}
```

---

## 🎨 Design

**Paleta de Cores Terrosas:**
- Primária: `#8b5a3c` (Marrom)
- Secundária: `#c19a6b` (Bege/Ocre)
- Background: `#f5f1e8` (Bege claro)
- Texto: `#3a2f23` (Marrom escuro)
- Texto secundário: `#6b5d4f` (Cinza terroso)

---

## 🚀 Próximos Passos

Se você quiser **hospedar publicamente** em um domínio próprio:

1. **Deploy do Frontend**:
   - Vercel
   - Netlify
   - GitHub Pages

2. **Backend já está pronto**:
   - Supabase Edge Functions rodando
   - Não precisa fazer nada

3. **Configuração de Domínio**:
   - Conectar domínio personalizado ao frontend
   - Backend já tem CORS aberto para todos os domínios

---

## 📞 Suporte

O sistema está **100% funcional** e pronto para uso público agora mesmo através do Figma Make! 

Para qualquer dúvida sobre funcionalidades, consulte a documentação ou teste diretamente no sistema.
