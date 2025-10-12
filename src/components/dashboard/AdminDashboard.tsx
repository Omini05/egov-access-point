import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Users, FileText } from "lucide-react";

interface ServiceRequest {
  id: string;
  status: string;
  date_submitted: string;
  remarks: string | null;
  services: {
    name: string;
    departments: {
      name: string;
    };
  };
  profiles: {
    name: string;
    email: string;
  };
}

interface AdminDashboardProps {
  userRole: string;
  userId: string | null;
}

const AdminDashboard = ({ userRole }: AdminDashboardProps) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          id,
          status,
          date_submitted,
          remarks,
          services (
            name,
            departments (name)
          ),
          profiles:citizen_id (
            name,
            email
          )
        `)
        .order("date_submitted", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      
      // Calculate stats
      const pending = data?.filter(r => r.status === "pending").length || 0;
      const approved = data?.filter(r => r.status === "approved" || r.status === "completed").length || 0;
      const rejected = data?.filter(r => r.status === "rejected").length || 0;
      
      setStats({
        pending,
        approved,
        rejected,
        total: data?.length || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${newStatus} successfully`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {userRole === "super_admin" ? "Super Admin" : "Department Admin"} Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage and process citizen service requests
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary mr-3" />
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <span className="text-3xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-accent mr-3" />
              <span className="text-3xl font-bold">{stats.approved}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-destructive mr-3" />
              <span className="text-3xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>
            Review and process citizen applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">
              Loading requests...
            </p>
          ) : requests.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No requests to display
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {request.services.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.services.departments.name} Department
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Applicant: {request.profiles.name} ({request.profiles.email})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(request.date_submitted).toLocaleString()}
                      </p>
                    </div>
                    <Badge>
                      {request.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(request.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(request.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(request.id, "under_review")}
                      >
                        Under Review
                      </Button>
                    </div>
                  )}

                  {request.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(request.id, "completed")}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
