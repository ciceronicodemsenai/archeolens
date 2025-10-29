import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { MapPin, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Site {
  id: string;
  name: string;
  description: string;
  location: string;
  highlight: string;
  state: string;
  city: string;
  createdBy: string;
  createdAt: string;
}

interface SitesListProps {
  accessToken: string;
  userId: string;
}

export function SitesList({ accessToken, userId }: SitesListProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [highlight, setHighlight] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

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
      toast.error('Erro ao carregar sítios');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingSite
        ? `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/sites/${editingSite.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/sites`;

      const method = editingSite ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          location,
          highlight,
          state,
          city,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao salvar sítio');
        setIsLoading(false);
        return;
      }

      toast.success(editingSite ? 'Sítio atualizado com sucesso!' : 'Sítio cadastrado com sucesso!');
      setIsDialogOpen(false);
      resetForm();
      fetchSites();
    } catch (error: any) {
      console.error('Error saving site:', error);
      toast.error('Erro ao salvar sítio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setName(site.name);
    setDescription(site.description);
    setLocation(site.location);
    setHighlight(site.highlight);
    setState(site.state);
    setCity(site.city);
    setIsDialogOpen(true);
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este sítio?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/sites/${siteId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao excluir sítio');
        return;
      }

      toast.success('Sítio excluído com sucesso!');
      fetchSites();
    } catch (error) {
      console.error('Error deleting site:', error);
      toast.error('Erro ao excluir sítio');
    }
  };

  const resetForm = () => {
    setEditingSite(null);
    setName('');
    setDescription('');
    setLocation('');
    setHighlight('');
    setState('');
    setCity('');
  };

  const openInGoogleMaps = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[#3a2f23] mb-2">Sítios Arqueológicos</h1>
          <p className="text-[#6b5d4f]">Gerencie os sítios arqueológicos cadastrados</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b5a3c] hover:bg-[#6b5d4f]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Sítio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSite ? 'Editar Sítio' : 'Novo Sítio Arqueológico'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do sítio arqueológico
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Sítio</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Sítio Arqueológico Serra da Capivara"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o sítio arqueológico..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ex: Piauí"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Raimundo Nonato"
                    required
                  />
                </div>
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
                <Label htmlFor="highlight">Destaque</Label>
                <Textarea
                  id="highlight"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  placeholder="O que torna este sítio especial?"
                  rows={3}
                  required
                />
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : editingSite ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card key={site.id} className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-[#3a2f23] mb-2">{site.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-[#6b5d4f]">
                    <MapPin className="h-4 w-4" />
                    {site.city}, {site.state}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#3a2f23] mb-3">{site.description}</p>
              
              <div className="mb-3">
                <p className="text-[#8b5a3c] mb-1">Destaque:</p>
                <p className="text-[#6b5d4f]">{site.highlight}</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openInGoogleMaps(site.location)}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver no Mapa
                </Button>
                
                {site.createdBy === userId && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(site)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(site.id)}
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

      {sites.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-[#d4a574] mx-auto mb-4" />
          <h3 className="text-[#3a2f23] mb-2">Nenhum sítio cadastrado</h3>
          <p className="text-[#6b5d4f] mb-4">Comece cadastrando seu primeiro sítio arqueológico</p>
        </div>
      )}
    </div>
  );
}
