export default function Header() {
  return (
    <header className="w-full border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-primary">🔧</span>
          <span>ServiceConnect</span>
        </div>

        {/* CENTER: Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavItem icon="🔍" label="Find Services" />
          <NavItem icon="📄" label="Request Service" />
          <NavItem icon="📅" label="My Bookings" badge="3" />
          <NavItem icon="⭐" label="Reviews" />
        </nav>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Language */}
          <div className="flex items-center gap-2 text-sm">
            <button>EN</button>
            <button>हिंदी</button>
            <button>తెలుగు</button>
          </div>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            📍 <span>San Francisco, CA</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 text-sm">
            👤 <span>Customer</span>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden">☰</button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ icon, label, badge }) {
  return (
    <div className="relative flex items-center gap-2 cursor-pointer">
      <span>{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ml-1 rounded-full bg-primary text-white text-xs px-2">
          {badge}
        </span>
      )}
    </div>
  );
}
