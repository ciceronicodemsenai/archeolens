import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Package, Plus, Edit, Trash2, MapPin, ExternalLink, Upload, Image } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Artifact {
  id: string;
  name: string;
  archaeologist: string;
  location: string;
  siteId: string;
  description?: string;
  photoUrl?: string;
  createdBy: string;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
}

interface ArtifactsListProps {
  accessToken: string;
  userId: string;
}

export function ArtifactsList({ accessToken, userId }: ArtifactsListProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [archaeologist, setArchaeologist] = useState('');
  const [location, setLocation] = useState('');
  const [siteId, setSiteId] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchArtifacts();
    fetchSites();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/artifacts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setArtifacts(data.artifacts || []);
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      toast.error('Erro ao carregar artefatos');
    }
  };

  const fetchSites = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/sites`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSites(data.sites || []);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingArtifact
        ? `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/artifacts/${editingArtifact.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/artifacts`;

      const method = editingArtifact ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          archaeologist,
          location,
          siteId,
          description,
          photoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao salvar artefato');
        setIsLoading(false);
        return;
      }

      toast.success(editingArtifact ? 'Artefato atualizado com sucesso!' : 'Artefato cadastrado com sucesso!');
      setIsDialogOpen(false);
      resetForm();
      fetchArtifacts();
    } catch (error: any) {
      console.error('Error saving artifact:', error);
      toast.error('Erro ao salvar artefato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setName(artifact.name);
    setArchaeologist(artifact.archaeologist);
    setLocation(artifact.location);
    setSiteId(artifact.siteId);
    setDescription(artifact.description || '');
    setPhotoUrl(artifact.photoUrl || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (artifactId: string) => {
    if (!confirm('Tem certeza que deseja excluir este artefato?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/artifacts/${artifactId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao excluir artefato');
        return;
      }

      toast.success('Artefato excluído com sucesso!');
      fetchArtifacts();
    } catch (error) {
      console.error('Error deleting artifact:', error);
      toast.error('Erro ao excluir artefato');
    }
  };

  const resetForm = () => {
    setEditingArtifact(null);
    setName('');
    setArchaeologist('');
    setLocation('');
    setSiteId('');
    setDescription('');
    setPhotoUrl('');
  };

  const getSiteName = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : 'Sítio não encontrado';
  };

  const openInGoogleMaps = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/upload-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao fazer upload da foto');
        setIsUploading(false);
        return;
      }

      setPhotoUrl(data.photoUrl);
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#3a2f23] mb-2">Artefatos</h1>
          <p className="text-[#6b5d4f]">Gerencie os artefatos encontrados</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b5a3c] hover:bg-[#6b5d4f]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Artefato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingArtifact ? 'Editar Artefato' : 'Novo Artefato'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do artefato encontrado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Artefato</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ponta de Lança de Pedra"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="archaeologist">Nome do Arqueólogo</Label>
                <Input
                  id="archaeologist"
                  value={archaeologist}
                  onChange={(e) => setArchaeologist(e.target.value)}
                  placeholder="Nome de quem encontrou o artefato"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Localização (Google Maps)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: -8.826944, -42.553889 ou endereço completo"
                  required
                />
                <p className="text-sm text-[#6b5d4f]">
                  Pode ser coordenadas GPS ou endereço completo
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site">Sítio Arqueológico</Label>
                <Select value={siteId} onValueChange={setSiteId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sítio onde foi encontrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sites.length === 0 && (
                  <p className="text-sm text-[#a0522d]">
                    Cadastre um sítio arqueológico primeiro
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Artefato</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o artefato encontrado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photoUrl">Foto do Artefato</Label>
                <div className="flex gap-2">
                  <Input
                    id="photoUrl"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Cole a URL da foto ou faça upload"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('photoUpload')?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {isUploading ? 'Carregando...' : 'Upload'}
                  </Button>
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
                {photoUrl && (
                  <div className="mt-2 border border-[#8b5a3c] rounded-md p-2 bg-[#f5f1e8]">
                    <p className="text-sm text-[#6b5d4f] mb-2">Preview:</p>
                    <ImageWithFallback
                      src={photoUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
                <p className="text-sm text-[#6b5d4f]">
                  Tamanho máximo: 5MB. Formatos aceitos: JPG, PNG, GIF
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || sites.length === 0}>
                  {isLoading ? 'Salvando...' : editingArtifact ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map((artifact) => (
          <Card key={artifact.id} className="border-[#8b5a3c] hover:shadow-lg transition-shadow overflow-hidden">
            {artifact.photoUrl && (
              <div className="relative h-48 bg-[#f5f1e8]">
                <ImageWithFallback
                  src={artifact.photoUrl}
                  alt={artifact.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-[#3a2f23] mb-2">{artifact.name}</CardTitle>
                  <CardDescription className="text-[#6b5d4f]">
                    Encontrado por: {artifact.archaeologist}
                  </CardDescription>
                </div>
                <Package className="h-8 w-8 text-[#c19a6b]" />
              </div>
            </CardHeader>
            <CardContent>
              {artifact.description && (
                <div className="mb-3 p-3 bg-[#f5f1e8] rounded-md">
                  <p className="text-[#6b5d4f] text-sm">{artifact.description}</p>
                </div>
              )}
              
              <div className="mb-3">
                <p className="text-[#8b5a3c] mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Sítio:
                </p>
                <p className="text-[#6b5d4f]">{getSiteName(artifact.siteId)}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openInGoogleMaps(artifact.location)}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver Localização
                </Button>
                
                {artifact.createdBy === userId && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(artifact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(artifact.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {artifacts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-[#d4a574] mx-auto mb-4" />
          <h3 className="text-[#3a2f23] mb-2">Nenhum artefato cadastrado</h3>
          <p className="text-[#6b5d4f] mb-4">Comece cadastrando seu primeiro artefato</p>
        </div>
      )}
    </div>
  );
}