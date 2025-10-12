import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              E-Governance Portal
            </h3>
            <p className="text-muted-foreground text-sm">
              Providing transparent and efficient government services to all citizens.
              Making governance accessible, accountable, and citizen-centric.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-muted-foreground hover:text-primary">
                  Track Application
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary">
                  Login / Register
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-primary">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Contact Information
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  Toll Free: 1800-XXX-XXXX
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  support@egov.gov.in
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  Government Secretariat, New Delhi
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 E-Governance Portal. All rights reserved. | Website designed
            according to GIGW guidelines.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
