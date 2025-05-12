
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
} from "@/components/ui/card";
import { 
  Building2, 
  Globe, 
  Shield, 
  Tag, 
  Bolt, 
  Zap, 
  Activity, 
  Receipt, 
  MessageSquare, 
  FileText, 
  CreditCard,
  Plug 
} from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { 
  useParties,
  useEndpoints, 
  useLocations, 
  useEVSEs, 
  useConnectors, 
  useSessions, 
  useCDRs, 
  useTokens 
} from '@/hooks/useOCPI';
import { Badge } from '@/components/ui/badge';

const OCPIManagement = () => {
  const { user } = useAuth();
  
  // Fetch summary counts
  const { getAll: getParties } = useParties();
  const { getAll: getEndpoints } = useEndpoints();
  const { getAll: getLocations } = useLocations();
  const { getAll: getEVSEs } = useEVSEs();
  const { getAll: getConnectors } = useConnectors();
  const { getAll: getSessions } = useSessions();
  const { getAll: getCDRs } = useCDRs();
  const { getAll: getTokens } = useTokens();
  
  const { data: parties, isLoading: loadingParties } = getParties();
  const { data: endpoints, isLoading: loadingEndpoints } = getEndpoints();
  const { data: locations, isLoading: loadingLocations } = getLocations();
  const { data: evses, isLoading: loadingEVSEs } = getEVSEs();
  const { data: connectors, isLoading: loadingConnectors } = getConnectors();
  const { data: sessions, isLoading: loadingSessions } = getSessions();
  const { data: cdrs, isLoading: loadingCDRs } = getCDRs();
  const { data: tokens, isLoading: loadingTokens } = getTokens();

  // OCPI module cards with counts and links
  const ocpiModules = [
    {
      title: "Parties",
      description: "Manage OCPI parties and roles",
      icon: Building2,
      count: parties?.length || 0,
      link: "/ocpi-management/parties",
      loading: loadingParties
    },
    {
      title: "Endpoints",
      description: "Configure OCPI endpoints",
      icon: Globe,
      count: endpoints?.length || 0,
      link: "/ocpi-management/endpoints",
      loading: loadingEndpoints
    },
    {
      title: "Credentials",
      description: "Manage OCPI credentials",
      icon: Shield,
      count: 0,
      link: "/ocpi-management/credentials",
      loading: false
    },
    {
      title: "Versions",
      description: "Configure OCPI versions",
      icon: Tag,
      count: 0,
      link: "/ocpi-management/versions",
      loading: false
    },
    {
      title: "Locations",
      description: "Manage charging locations",
      icon: Globe,
      count: locations?.length || 0,
      link: "/ocpi-management/locations",
      loading: loadingLocations
    },
    {
      title: "EVSEs",
      description: "Manage charging stations",
      icon: Bolt,
      count: evses?.length || 0,
      link: "/ocpi-management/evses",
      loading: loadingEVSEs
    },
    {
      title: "Connectors",
      description: "Manage charging connectors",
      icon: Plug,
      count: connectors?.length || 0,
      link: "/ocpi-management/connectors",
      loading: loadingConnectors
    },
    {
      title: "Sessions",
      description: "View charging sessions",
      icon: Activity,
      count: sessions?.length || 0,
      link: "/ocpi-management/sessions",
      loading: loadingSessions
    },
    {
      title: "CDRs",
      description: "Manage charging data records",
      icon: Receipt,
      count: cdrs?.length || 0,
      link: "/ocpi-management/cdrs",
      loading: loadingCDRs
    },
    {
      title: "Tokens",
      description: "Manage authorization tokens",
      icon: Tag,
      count: tokens?.length || 0,
      link: "/ocpi-management/tokens",
      loading: loadingTokens
    },
    {
      title: "Commands",
      description: "Send and receive OCPI commands",
      icon: MessageSquare,
      count: 0,
      link: "/ocpi-management/commands",
      loading: false
    },
    {
      title: "Charging Profiles",
      description: "Configure charging profiles",
      icon: FileText,
      count: 0,
      link: "/ocpi-management/charging-profiles",
      loading: false
    },
    {
      title: "Tariffs",
      description: "Manage charging tariffs",
      icon: CreditCard,
      count: 0,
      link: "/ocpi-management/tariffs",
      loading: false
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>OCPI Management</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">OCPI Management</h1>
        <p className="text-muted-foreground">
          Open Charge Point Interface (OCPI) allows for connecting charging station networks and service providers.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ocpiModules.map((module, index) => (
          <Link key={index} to={module.link}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <module.icon className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-2">{module.description}</CardDescription>
                <div className="flex items-center mt-4">
                  {module.loading ? (
                    <Badge variant="secondary">Loading...</Badge>
                  ) : (
                    <Badge variant="secondary">{module.count} items</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OCPIManagement;
