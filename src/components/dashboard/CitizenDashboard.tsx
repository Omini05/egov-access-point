import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ServiceRequest {
  id: string;
  status: string;
  date_submitted: string;
  services: {
    name: string;
    departments: {
      name: string;
    };
  };
}

interface CitizenDashboardProps {
  userId: string | null;
}

const CitizenDashboard = ({ userId }: CitizenDashboardProps) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          id,
          status,
          date_submitted,
          services (
            name,
            departments (name)
          )
        `)
        .eq("citizen_id", userId)
        .order("date_submitted", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "under_review":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      under_review: "default",
      approved: "outline",
      completed: "outline",
      rejected: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Citizen Dashboard
        </h1>
        <p className="text-muted-foreground">
          View and manage your service applications
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Apply for Service</CardTitle>
            <CardDescription>
              Browse and apply for government services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/services">
              <Button className="w-full">Browse Services</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Track Application</CardTitle>
            <CardDescription>
              Check status of your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/track">
              <Button variant="outline" className="w-full">
                Track Status
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Applications</CardTitle>
            <CardDescription>
              Applications submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {requests.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Your recent service requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">
              Loading applications...
            </p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No applications yet
              </p>
              <Link to="/services">
                <Button>Apply for a Service</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <h4 className="font-medium text-foreground">
                        {request.services.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.services.departments.name} Department
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied on: {new Date(request.date_submitted).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenDashboard;
