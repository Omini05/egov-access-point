import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Calendar, IndianRupee, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApplicationData {
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
  payments: Array<{
    amount: number;
    method: string;
    status: string;
    transaction_id: string;
  }>;
}

const Track = () => {
  const [applicationId, setApplicationId] = useState("");
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an application ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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
        .eq("id", applicationId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not Found",
          description: "No application found with this ID",
          variant: "destructive",
        });
        setApplication(null);
      } else {
        setApplication(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Track Your Application</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Enter Application ID</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <Label htmlFor="app-id">Application ID</Label>
                  <Input
                    id="app-id"
                    placeholder="Enter your application ID"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Searching..." : "Track Status"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {application && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{application.services.name}</CardTitle>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Application ID:</span>
                    <span className="text-muted-foreground">{application.id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Department:</span>
                    <span>{application.services.departments.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Submitted:</span>
                    <span>{new Date(application.date_submitted).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Fee:</span>
                    <span>₹{application.services.fee}</span>
                  </div>

                  {application.payments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm col-span-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Payment:</span>
                      <span className="text-green-600">
                        {application.payments[0].status.toUpperCase()} - {application.payments[0].transaction_id}
                      </span>
                    </div>
                  )}
                </div>

                {application.remarks && (
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm"><strong>Remarks:</strong> {application.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Track;
