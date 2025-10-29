import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase Storage bucket for artifact photos
const initStorage = async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const bucketName = 'make-9e6b04bc-artifact-photos';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log('Created artifact photos bucket');
    }
  } catch (error) {
    console.log(`Error initializing storage: ${error.message}`);
  }
};

initStorage();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9e6b04bc/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up route
app.post("/make-server-9e6b04bc/signup", async (c) => {
  try {
    const { email, password, name, profession, age, specialty } = await c.req.json();
    
    if (!email || !password || !name || !profession || !age) {
      return c.json({ error: "Todos os campos são obrigatórios" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, profession, age, specialty },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      profession,
      age,
      specialty: specialty || '',
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { id: data.user.id, email, name, profession, age, specialty } 
    });
  } catch (error) {
    console.log(`Error in signup route: ${error.message}`);
    return c.json({ error: "Erro ao criar usuário" }, 500);
  }
});

// ==================== SITE ROUTES ====================

// Create archaeological site
app.post("/make-server-9e6b04bc/sites", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { name, description, location, highlight, state, city } = await c.req.json();
    
    if (!name || !description || !location || !highlight || !state || !city) {
      return c.json({ error: "Todos os campos são obrigatórios" }, 400);
    }

    const siteId = crypto.randomUUID();
    const site = {
      id: siteId,
      name,
      description,
      location,
      highlight,
      state,
      city,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(`site:${siteId}`, site);
    
    return c.json({ success: true, site });
  } catch (error) {
    console.log(`Error creating archaeological site: ${error.message}`);
    return c.json({ error: "Erro ao criar sítio arqueológico" }, 500);
  }
});

// Get all sites
app.get("/make-server-9e6b04bc/sites", async (c) => {
  try {
    const sites = await kv.getByPrefix("site:");
    return c.json({ sites });
  } catch (error) {
    console.log(`Error fetching sites: ${error.message}`);
    return c.json({ error: "Erro ao buscar sítios" }, 500);
  }
});

// Search sites
app.get("/make-server-9e6b04bc/sites/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    const searchType = c.req.query('type') || 'name'; // name, state, city
    
    const allSites = await kv.getByPrefix("site:");
    
    const filteredSites = allSites.filter((site: any) => {
      if (searchType === 'name') {
        return site.name.toLowerCase().includes(query);
      } else if (searchType === 'state') {
        return site.state.toLowerCase().includes(query);
      } else if (searchType === 'city') {
        return site.city.toLowerCase().includes(query);
      }
      return false;
    });

    return c.json({ sites: filteredSites });
  } catch (error) {
    console.log(`Error searching sites: ${error.message}`);
    return c.json({ error: "Erro ao buscar sítios" }, 500);
  }
});

// Get single site
app.get("/make-server-9e6b04bc/sites/:id", async (c) => {
  try {
    const siteId = c.req.param('id');
    const site = await kv.get(`site:${siteId}`);
    
    if (!site) {
      return c.json({ error: "Sítio não encontrado" }, 404);
    }

    return c.json({ site });
  } catch (error) {
    console.log(`Error fetching site: ${error.message}`);
    return c.json({ error: "Erro ao buscar sítio" }, 500);
  }
});

// Update site
app.put("/make-server-9e6b04bc/sites/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const siteId = c.req.param('id');
    const existingSite = await kv.get(`site:${siteId}`);
    
    if (!existingSite) {
      return c.json({ error: "Sítio não encontrado" }, 404);
    }

    if (existingSite.createdBy !== user.id) {
      return c.json({ error: "Você não tem permissão para editar este sítio" }, 403);
    }

    const { name, description, location, highlight, state, city } = await c.req.json();
    
    const updatedSite = {
      ...existingSite,
      name: name || existingSite.name,
      description: description || existingSite.description,
      location: location || existingSite.location,
      highlight: highlight || existingSite.highlight,
      state: state || existingSite.state,
      city: city || existingSite.city,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`site:${siteId}`, updatedSite);
    
    return c.json({ success: true, site: updatedSite });
  } catch (error) {
    console.log(`Error updating site: ${error.message}`);
    return c.json({ error: "Erro ao atualizar sítio" }, 500);
  }
});

// Delete site
app.delete("/make-server-9e6b04bc/sites/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const siteId = c.req.param('id');
    const existingSite = await kv.get(`site:${siteId}`);
    
    if (!existingSite) {
      return c.json({ error: "Sítio não encontrado" }, 404);
    }

    if (existingSite.createdBy !== user.id) {
      return c.json({ error: "Você não tem permissão para excluir este sítio" }, 403);
    }

    await kv.del(`site:${siteId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting site: ${error.message}`);
    return c.json({ error: "Erro ao excluir sítio" }, 500);
  }
});

// ==================== ARTIFACT ROUTES ====================

// Create artifact
app.post("/make-server-9e6b04bc/artifacts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { name, archaeologist, location, siteId, description, photoUrl } = await c.req.json();
    
    if (!name || !archaeologist || !location || !siteId) {
      return c.json({ error: "Todos os campos obrigatórios devem ser preenchidos" }, 400);
    }

    const artifactId = crypto.randomUUID();
    const artifact = {
      id: artifactId,
      name,
      archaeologist,
      location,
      siteId,
      description: description || '',
      photoUrl: photoUrl || '',
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(`artifact:${artifactId}`, artifact);
    
    return c.json({ success: true, artifact });
  } catch (error) {
    console.log(`Error creating artifact: ${error.message}`);
    return c.json({ error: "Erro ao criar artefato" }, 500);
  }
});

// Get all artifacts
app.get("/make-server-9e6b04bc/artifacts", async (c) => {
  try {
    const artifacts = await kv.getByPrefix("artifact:");
    return c.json({ artifacts });
  } catch (error) {
    console.log(`Error fetching artifacts: ${error.message}`);
    return c.json({ error: "Erro ao buscar artefatos" }, 500);
  }
});

// Search artifacts
app.get("/make-server-9e6b04bc/artifacts/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    
    const allArtifacts = await kv.getByPrefix("artifact:");
    
    const filteredArtifacts = allArtifacts.filter((artifact: any) => {
      return artifact.name.toLowerCase().includes(query) || 
             artifact.archaeologist.toLowerCase().includes(query);
    });

    return c.json({ artifacts: filteredArtifacts });
  } catch (error) {
    console.log(`Error searching artifacts: ${error.message}`);
    return c.json({ error: "Erro ao buscar artefatos" }, 500);
  }
});

// Get single artifact
app.get("/make-server-9e6b04bc/artifacts/:id", async (c) => {
  try {
    const artifactId = c.req.param('id');
    const artifact = await kv.get(`artifact:${artifactId}`);
    
    if (!artifact) {
      return c.json({ error: "Artefato não encontrado" }, 404);
    }

    return c.json({ artifact });
  } catch (error) {
    console.log(`Error fetching artifact: ${error.message}`);
    return c.json({ error: "Erro ao buscar artefato" }, 500);
  }
});

// Update artifact
app.put("/make-server-9e6b04bc/artifacts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const artifactId = c.req.param('id');
    const existingArtifact = await kv.get(`artifact:${artifactId}`);
    
    if (!existingArtifact) {
      return c.json({ error: "Artefato não encontrado" }, 404);
    }

    if (existingArtifact.createdBy !== user.id) {
      return c.json({ error: "Você não tem permissão para editar este artefato" }, 403);
    }

    const { name, archaeologist, location, siteId, description, photoUrl } = await c.req.json();
    
    const updatedArtifact = {
      ...existingArtifact,
      name: name || existingArtifact.name,
      archaeologist: archaeologist || existingArtifact.archaeologist,
      location: location || existingArtifact.location,
      siteId: siteId || existingArtifact.siteId,
      description: description || existingArtifact.description,
      photoUrl: photoUrl || existingArtifact.photoUrl,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`artifact:${artifactId}`, updatedArtifact);
    
    return c.json({ success: true, artifact: updatedArtifact });
  } catch (error) {
    console.log(`Error updating artifact: ${error.message}`);
    return c.json({ error: "Erro ao atualizar artefato" }, 500);
  }
});

// Delete artifact
app.delete("/make-server-9e6b04bc/artifacts/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const artifactId = c.req.param('id');
    const existingArtifact = await kv.get(`artifact:${artifactId}`);
    
    if (!existingArtifact) {
      return c.json({ error: "Artefato não encontrado" }, 404);
    }

    if (existingArtifact.createdBy !== user.id) {
      return c.json({ error: "Você não tem permissão para excluir este artefato" }, 403);
    }

    await kv.del(`artifact:${artifactId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting artifact: ${error.message}`);
    return c.json({ error: "Erro ao excluir artefato" }, 500);
  }
});

// ==================== ARCHAEOLOGIST ROUTES ====================

// Search archaeologists
app.get("/make-server-9e6b04bc/archaeologists", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    
    const allUsers = await kv.getByPrefix("user:");
    
    const archaeologists = allUsers.filter((user: any) => {
      return user.profession.toLowerCase().includes('arqueólogo') ||
             user.profession.toLowerCase().includes('arqueologo') ||
             user.name.toLowerCase().includes(query);
    });

    // Remove sensitive data
    const safeArchaeologists = archaeologists.map((user: any) => ({
      id: user.id,
      name: user.name,
      profession: user.profession,
      age: user.age,
      specialty: user.specialty
    }));

    return c.json({ archaeologists: safeArchaeologists });
  } catch (error) {
    console.log(`Error searching archaeologists: ${error.message}`);
    return c.json({ error: "Erro ao buscar arqueólogos" }, 500);
  }
});

// ==================== PHOTO UPLOAD ROUTE ====================

// Upload artifact photo
app.post("/make-server-9e6b04bc/upload-photo", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "Nenhum arquivo enviado" }, 400);
    }

    // Check file size (5MB max)
    if (file.size > 5242880) {
      return c.json({ error: "Arquivo muito grande. Máximo 5MB" }, 400);
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: "Apenas imagens são permitidas" }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const bucketName = 'make-9e6b04bc-artifact-photos';

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log(`Error uploading file to storage: ${uploadError.message}`);
      return c.json({ error: "Erro ao fazer upload da foto" }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    if (!urlData) {
      return c.json({ error: "Erro ao gerar URL da foto" }, 500);
    }

    return c.json({ 
      success: true, 
      photoUrl: urlData.signedUrl,
      fileName: fileName
    });
  } catch (error) {
    console.log(`Error in photo upload route: ${error.message}`);
    return c.json({ error: "Erro ao fazer upload da foto" }, 500);
  }
});

Deno.serve(app.fetch);