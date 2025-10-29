import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Package, Users, Search, ExternalLink } from 'lucide-react';
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
}

interface Artifact {
  id: string;
  name: string;
  archaeologist: string;
  location: string;
  siteId: string;
  description?: string;
  photoUrl?: string;
}

interface Archaeologist {
  id: string;
  name: string;
  profession: string;
  age: number;
  specialty?: string;
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [isSearching, setIsSearching] = useState(false);

  // Results
  const [siteResults, setSiteResults] = useState<Site[]>([]);
  const [artifactResults, setArtifactResults] = useState<Artifact[]>([]);
  const [archaeologistResults, setArchaeologistResults] = useState<Archaeologist[]>([]);

  const searchSites = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um termo de busca');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/sites/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSiteResults(data.sites || []);
        if (data.sites.length === 0) {
          toast.info('Nenhum sítio encontrado');
        } else {
          toast.success(`${data.sites.length} sítio(s) encontrado(s)`);
        }
      }
    } catch (error) {
      console.error('Error searching sites:', error);
      toast.error('Erro ao buscar sítios');
    } finally {
      setIsSearching(false);
    }
  };

  const searchArtifacts = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um termo de busca');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/artifacts/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setArtifactResults(data.artifacts || []);
        if (data.artifacts.length === 0) {
          toast.info('Nenhum artefato encontrado');
        } else {
          toast.success(`${data.artifacts.length} artefato(s) encontrado(s)`);
        }
      }
    } catch (error) {
      console.error('Error searching artifacts:', error);
      toast.error('Erro ao buscar artefatos');
    } finally {
      setIsSearching(false);
    }
  };

  const searchArchaeologists = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/archaeologists?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setArchaeologistResults(data.archaeologists || []);
        if (data.archaeologists.length === 0) {
          toast.info('Nenhum arqueólogo encontrado');
        } else {
          toast.success(`${data.archaeologists.length} arqueólogo(s) encontrado(s)`);
        }
      }
    } catch (error) {
      console.error('Error searching archaeologists:', error);
      toast.error('Erro ao buscar arqueólogos');
    } finally {
      setIsSearching(false);
    }
  };

  const openInGoogleMaps = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-[#3a2f23] mb-2">Buscar</h1>
        <p className="text-[#6b5d4f]">Pesquise sítios, artefatos e arqueólogos</p>
      </div>

      <Tabs defaultValue="sites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sites" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Sítios
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Artefatos
          </TabsTrigger>
          <TabsTrigger value="archaeologists" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Arqueólogos
          </TabsTrigger>
        </TabsList>

        {/* SITES SEARCH */}
        <TabsContent value="sites" className="space-y-6">
          <Card className="border-[#8b5a3c]">
            <CardHeader>
              <CardTitle className="text-[#3a2f23]">Buscar Sítios Arqueológicos</CardTitle>
              <CardDescription>Pesquise por nome, estado ou cidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="site-search">Termo de busca</Label>
                    <Input
                      id="site-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite o que deseja buscar..."
                      onKeyPress={(e) => e.key === 'Enter' && searchSites()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-type">Buscar por</Label>
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nome</SelectItem>
                        <SelectItem value="state">Estado</SelectItem>
                        <SelectItem value="city">Cidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={searchSites} disabled={isSearching} className="w-full md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {siteResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteResults.map((site) => (
                <Card key={site.id} className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-[#3a2f23]">{site.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-[#6b5d4f]">
                      <MapPin className="h-4 w-4" />
                      {site.city}, {site.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#3a2f23] mb-3">{site.description}</p>
                    <div className="mb-3">
                      <p className="text-[#8b5a3c] mb-1">Destaque:</p>
                      <p className="text-[#6b5d4f]">{site.highlight}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInGoogleMaps(site.location)}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver no Mapa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ARTIFACTS SEARCH */}
        <TabsContent value="artifacts" className="space-y-6">
          <Card className="border-[#8b5a3c]">
            <CardHeader>
              <CardTitle className="text-[#3a2f23]">Buscar Artefatos</CardTitle>
              <CardDescription>Pesquise por nome do artefato ou arqueólogo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artifact-search">Termo de busca</Label>
                  <Input
                    id="artifact-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite o nome do artefato ou arqueólogo..."
                    onKeyPress={(e) => e.key === 'Enter' && searchArtifacts()}
                  />
                </div>
                <Button onClick={searchArtifacts} disabled={isSearching} className="w-full md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {artifactResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artifactResults.map((artifact) => (
                <Card key={artifact.id} className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#3a2f23]">{artifact.name}</CardTitle>
                        <CardDescription className="text-[#6b5d4f]">
                          Encontrado por: {artifact.archaeologist}
                        </CardDescription>
                      </div>
                      <Package className="h-8 w-8 text-[#c19a6b]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInGoogleMaps(artifact.location)}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Localização
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ARCHAEOLOGISTS SEARCH */}
        <TabsContent value="archaeologists" className="space-y-6">
          <Card className="border-[#8b5a3c]">
            <CardHeader>
              <CardTitle className="text-[#3a2f23]">Buscar Arqueólogos</CardTitle>
              <CardDescription>Pesquise arqueólogos cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="archaeologist-search">Nome (opcional)</Label>
                  <Input
                    id="archaeologist-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite o nome do arqueólogo ou deixe em branco para ver todos"
                    onKeyPress={(e) => e.key === 'Enter' && searchArchaeologists()}
                  />
                </div>
                <Button onClick={searchArchaeologists} disabled={isSearching} className="w-full md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {archaeologistResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archaeologistResults.map((archaeologist) => (
                <Card key={archaeologist.id} className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-[#3a2f23]">{archaeologist.name}</CardTitle>
                        <CardDescription className="text-[#6b5d4f]">
                          {archaeologist.profession}
                        </CardDescription>
                      </div>
                      <Users className="h-8 w-8 text-[#d4a574]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#6b5d4f]">Idade: {archaeologist.age} anos</p>
                    {archaeologist.specialty && (
                      <p className="text-[#6b5d4f]">Especialidade: {archaeologist.specialty}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}