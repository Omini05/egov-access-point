import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, FileText, Calendar, User, IndianRupee } from "lucide-react";

interface ServiceRequest {
  id: string;
  status: string;
  date_submitted: string;
  remarks: string | null;
  services: {
    name: string;
    fee: number;
    departments: {
      name: string;
    };
  };
  citizen_id: string;
  payments: Array<{
    amount: number;
    method: string;
    status: string;
    transaction_id: string;
  }>;
}

interface AdminDashboardProps {
  userRole: string | null;
  userId: string | null;
}

const AdminDashboard = ({ userRole, userId }: AdminDashboardProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; email: string }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

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
          citizen_id,
          services (
            name,
            fee,
            departments (name)
          ),
          payments (
            amount,
            method,
            status,
            transaction_id
          )
        `)
        .order("date_submitted", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      
      // Fetch profiles for all citizen_ids
      if (data && data.length > 0) {
        const citizenIds = [...new Set(data.map(r => r.citizen_id))];
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", citizenIds);

        if (!profileError && profileData) {
          const profileMap: Record<string, { name: string; email: string }> = {};
          profileData.forEach(p => {
            profileMap[p.id] = { name: p.name, email: p.email || "" };
          });
          setProfiles(profileMap);
        }
      }
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(r => r.status === "pending").length || 0;
      const approved = data?.filter(r => r.status === "approved" || r.status === "completed").length || 0;
      const rejected = data?.filter(r => r.status === "rejected").length || 0;
      
      setStats({ total, pending, approved, rejected });
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

  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      const newStatus = actionType === "approve" ? "approved" : "rejected";
      
      const { error } = await supabase
        .from("service_requests")
        .update({
          status: newStatus,
          remarks: remarks || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${actionType === "approve" ? "approved" : "rejected"} successfully`,
      });

      setActionDialog(false);
      setSelectedRequest(null);
      setRemarks("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const openActionDialog = (request: ServiceRequest, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
    setActionDialog(true);
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
          {userRole === "super_admin" ? "Super Admin Dashboard" : "Department Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          Manage service requests and applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-destructive">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Applications</CardTitle>
          <CardDescription>
            Review and process citizen applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-muted-foreground">Loading applications...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const applicant = profiles[request.citizen_id];
                return (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{request.services.name}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.services.departments.name} Department
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Applicant:</span>
                        <span>{applicant?.name || "Unknown"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Submitted:</span>
                        <span>{new Date(request.date_submitted).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fee:</span>
                        <span>₹{request.services.fee}</span>
                      </div>

                      {request.payments.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Payment:</span>
                          <span className="text-green-600">
                            {request.payments[0].status.toUpperCase()} - {request.payments[0].transaction_id}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.remarks && (
                      <div className="mb-4 p-3 bg-muted rounded">
                        <p className="text-sm"><strong>Remarks:</strong> {request.remarks}</p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={() => openActionDialog(request, "approve")}
                          className="flex-1"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => openActionDialog(request, "reject")}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onOpenChange={setActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Confirm approval of this application"
                : "Provide a reason for rejection"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="remarks">Remarks {actionType === "reject" ? "*" : "(Optional)"}</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks or reason..."
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAction}
                className="flex-1"
                variant={actionType === "approve" ? "default" : "destructive"}
              >
                Confirm {actionType === "approve" ? "Approval" : "Rejection"}
              </Button>
              <Button
                onClick={() => {
                  setActionDialog(false);
                  setRemarks("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
