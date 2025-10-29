import { Menu, LogOut, MapPin, Package, Search, Home } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  userName: string;
}

export function Navbar({ currentPage, onNavigate, onLogout, userName }: NavbarProps) {
  return (
    <nav className="bg-[#3a2f23] text-[#f5f1e8] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-[#d4a574]" />
              <h1 className="text-[#d4a574]">ARCHEOLENS</h1>
            </div>
            
            <div className="hidden md:flex gap-2">
              <Button
                variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
                onClick={() => onNavigate('dashboard')}
                className="text-[#f5f1e8] hover:bg-[#6b5d4f]"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
              <Button
                variant={currentPage === 'sites' ? 'secondary' : 'ghost'}
                onClick={() => onNavigate('sites')}
                className="text-[#f5f1e8] hover:bg-[#6b5d4f]"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Sítios
              </Button>
              <Button
                variant={currentPage === 'artifacts' ? 'secondary' : 'ghost'}
                onClick={() => onNavigate('artifacts')}
                className="text-[#f5f1e8] hover:bg-[#6b5d4f]"
              >
                <Package className="h-4 w-4 mr-2" />
                Artefatos
              </Button>
              <Button
                variant={currentPage === 'search' ? 'secondary' : 'ghost'}
                onClick={() => onNavigate('search')}
                className="text-[#f5f1e8] hover:bg-[#6b5d4f]"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-[#d4a574]">{userName}</span>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-[#f5f1e8] hover:bg-[#6b5d4f]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
