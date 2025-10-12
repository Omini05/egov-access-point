import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";

const Track = () => {
  const [applicationId, setApplicationId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Track logic will be implemented
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Track Your Application</h1>
          <Card>
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
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Track Status
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Track;
