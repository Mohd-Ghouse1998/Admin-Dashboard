
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTenantClients } from "../../hooks/useTenantClients";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TenantClientDetailCardSkeleton } from "../../components/TenantClientDetailCardSkeleton";
import { formatDateTimeString } from "@/lib/formatters";

const TenantClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const { 
    getClient,
    deleteClient,
    isLoading, 
    isLoadingDelete
  } = useTenantClients();

  const { data: client, isLoading: isClientLoading, error } = getClient(clientId);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading client",
        description: error.message || "Failed to load client details",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteClient(clientId);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Client deleted",
        description: "The tenant client has been successfully deleted.",
        variant: "default"
      });
      
      navigate("/tenants/clients");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const renderClientInfo = () => {
    if (isClientLoading || !client) {
      return <TenantClientDetailCardSkeleton />;
    }

    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-semibold">Client Information</CardTitle>
              </div>
              {client.is_active ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                  Inactive
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <div className="font-medium text-base">{client.name}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Schema Name</label>
                <div className="font-medium text-base">{client.schema_name}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                <div className="font-medium text-base">{client.timezone || "Not specified"}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                <div className="font-medium text-base">{client.currency || "Not specified"}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Country</label>
                <div className="font-medium text-base">{client.country || "Not specified"}</div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Domains</label>
              {client.domains && client.domains.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.domains.map((domain, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                      {domain.domain}
                      {domain.is_primary && <span className="ml-1">(Primary)</span>}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No domains configured</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Created At</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{client.created_at ? formatDateTimeString(client.created_at) : "Not available"}</p>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Updated At</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{client.updated_at ? formatDateTimeString(client.updated_at) : "Not available"}</p>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Apps Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{client.apps_access?.length || 0} apps configured</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      title={isClientLoading ? "Loading..." : `${client?.name || "Client"} Details`}
      description={isClientLoading ? "Loading client information..." : `View and manage details for ${client?.name}`}
      backButton
      backTo="/tenants/clients"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isLoadingDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button
            size="sm"
            asChild
          >
            <Link to={`/tenants/clients/${clientId}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      }
    >
      <Helmet>
        <title>
          {isClientLoading ? "Client Details" : `${client?.name} | Admin Dashboard`}
        </title>
      </Helmet>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="py-4">
          {renderClientInfo()}
        </TabsContent>

        <TabsContent value="domains" className="py-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">Domain management functionality is under development.</p>
                <Button variant="outline" className="mt-4">
                  View All Domains <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="py-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">Apps management functionality is under development.</p>
                <Button variant="outline" className="mt-4">
                  View All Apps <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="py-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">Configuration management functionality is under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the tenant
              client and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoadingDelete}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default TenantClientDetailPage;
