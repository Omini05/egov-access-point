import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Clock, Shield, Building2, Users, Plus, Pause } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        
        setUserRole(roleData?.role || null);
      }
    } catch (error) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
  };
  const features = [
    {
      icon: FileText,
      title: "Apply Online",
      description: "Submit applications for various government services from home"
    },
    {
      icon: Search,
      title: "Track Status",
      description: "Real-time tracking of your application progress"
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "Quick turnaround time with automated workflows"
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  const popularServices = [
    { name: "Birth Certificate", department: "Revenue", fee: "₹50" },
    { name: "Driving License", department: "Transport", fee: "₹200" },
    { name: "Character Certificate", department: "Police", fee: "₹100" },
    { name: "Trade License", department: "Municipal", fee: "₹1,000" }
  ];

  if (!loading && (userRole === "department_admin" || userRole === "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Admin Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-secondary py-20 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Department Admin Portal
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
                Manage services, review applications, and oversee operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate('/dashboard')}>
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Quick Actions */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Service Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services')}>
                <CardHeader>
                  <Plus className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl">Add New Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Create and publish new government services for citizens
                  </CardDescription>
                  <Button className="mt-4 w-full">Add Service</Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services')}>
                <CardHeader>
                  <Pause className="h-12 w-12 mx-auto text-secondary mb-4" />
                  <CardTitle className="text-xl">Manage Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Activate or halt existing services as needed
                  </CardDescription>
                  <Button variant="outline" className="mt-4 w-full">Manage Services</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Admin Stats */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Quick Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <FileText className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle>Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Review pending applications</p>
                  <Button variant="link" className="mt-2" onClick={() => navigate('/dashboard')}>
                    View All →
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Building2 className="h-10 w-10 mx-auto text-secondary mb-2" />
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">Manage department services</p>
                  <Button variant="link" className="mt-2" onClick={() => navigate('/services')}>
                    Manage →
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-10 w-10 mx-auto text-accent mb-2" />
                  <CardTitle>Citizens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">View citizen applications</p>
                  <Button variant="link" className="mt-2" onClick={() => navigate('/dashboard')}>
                    View →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-secondary py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              E-Governance Citizen Service Portal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Access government services anytime, anywhere. Simple, transparent, and efficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Browse Services
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 hover:bg-white/20 border-white text-white">
                  Track Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Our Portal?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <feature.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
            Popular Services
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Most requested services by citizens across departments
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularServices.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.department} Department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{service.fee}</span>
                    <Link to="/services">
                      <Button size="sm">Apply Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="outline" size="lg">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Government Departments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Revenue", icon: FileText },
              { name: "Transport", icon: Building2 },
              { name: "Police", icon: Shield },
              { name: "Municipal", icon: Users }
            ].map((dept, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <dept.icon className="h-10 w-10 mx-auto text-secondary mb-2" />
                  <CardTitle>{dept.name} Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/services">
                    <Button variant="link" className="text-primary">
                      View Services →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Register now and access all government services from one platform
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
