import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { MapPin, Package, Users, TrendingUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DashboardProps {
  accessToken: string;
}

export function Dashboard({ accessToken }: DashboardProps) {
  const [stats, setStats] = useState({
    totalSites: 0,
    totalArtifacts: 0,
    totalArchaeologists: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch sites
      const sitesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/sites`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const sitesData = await sitesRes.json();

      // Fetch artifacts
      const artifactsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/artifacts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const artifactsData = await artifactsRes.json();

      // Fetch archaeologists
      const archaeologistsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9e6b04bc/archaeologists`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const archaeologistsData = await archaeologistsRes.json();

      setStats({
        totalSites: sitesData.sites?.length || 0,
        totalArtifacts: artifactsData.artifacts?.length || 0,
        totalArchaeologists: archaeologistsData.archaeologists?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-[#3a2f23] mb-2">Bem-vindo ao ARCHEOLENS</h1>
        <p className="text-[#6b5d4f]">Sistema de Gestão Arqueológica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#3a2f23]">Sítios Arqueológicos</CardTitle>
            <MapPin className="h-8 w-8 text-[#8b5a3c]" />
          </CardHeader>
          <CardContent>
            <div className="text-[#8b5a3c]">{stats.totalSites}</div>
            <p className="text-[#6b5d4f]">Total cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#3a2f23]">Artefatos</CardTitle>
            <Package className="h-8 w-8 text-[#c19a6b]" />
          </CardHeader>
          <CardContent>
            <div className="text-[#c19a6b]">{stats.totalArtifacts}</div>
            <p className="text-[#6b5d4f]">Total encontrados</p>
          </CardContent>
        </Card>

        <Card className="border-[#8b5a3c] hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[#3a2f23]">Arqueólogos</CardTitle>
            <Users className="h-8 w-8 text-[#d4a574]" />
          </CardHeader>
          <CardContent>
            <div className="text-[#d4a574]">{stats.totalArchaeologists}</div>
            <p className="text-[#6b5d4f]">Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[#8b5a3c]">
          <CardHeader>
            <CardTitle className="text-[#3a2f23]">Sobre o Sistema</CardTitle>
            <CardDescription>ARCHEOLENS - Gestão Arqueológica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[#3a2f23]">
              O ARCHEOLENS é um sistema completo para gestão de descobertas arqueológicas,
              permitindo o cadastro e acompanhamento de sítios arqueológicos e artefatos encontrados.
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#6b5d4f]">
              <li>Cadastre sítios arqueológicos com localização GPS</li>
              <li>Registre artefatos encontrados</li>
              <li>Busque informações detalhadas</li>
              <li>Controle de acesso e permissões</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-[#8b5a3c]">
          <CardHeader>
            <CardTitle className="text-[#3a2f23]">Começando</CardTitle>
            <CardDescription>Próximos passos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-[#8b5a3c] mt-0.5" />
              <div>
                <p className="text-[#3a2f23]">Cadastre um Sítio Arqueológico</p>
                <p className="text-[#6b5d4f]">Registre os locais de suas descobertas</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="h-5 w-5 text-[#c19a6b] mt-0.5" />
              <div>
                <p className="text-[#3a2f23]">Registre Artefatos</p>
                <p className="text-[#6b5d4f]">Documente suas descobertas</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-[#d4a574] mt-0.5" />
              <div>
                <p className="text-[#3a2f23]">Explore e Pesquise</p>
                <p className="text-[#6b5d4f]">Busque por sítios e artefatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
