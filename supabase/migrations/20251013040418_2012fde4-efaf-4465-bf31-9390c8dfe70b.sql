-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('citizen', 'data_entry_operator', 'department_admin', 'super_admin');

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  mobile TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  fee DECIMAL(10, 2) DEFAULT 0,
  processing_time TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
  date_submitted TIMESTAMP WITH TIME ZONE DEFAULT now(),
  remarks TEXT,
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT CHECK (method IN ('card', 'upi', 'net_banking', 'cash')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for departments
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Only super_admin can manage departments" ON public.departments FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admin can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for services
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Department admins can manage their services" ON public.services FOR ALL USING (
  public.has_role(auth.uid(), 'department_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for service_requests
CREATE POLICY "Citizens can view their own requests" ON public.service_requests FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Citizens can create requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Admins can view all requests" ON public.service_requests FOR SELECT USING (
  public.has_role(auth.uid(), 'department_admin') OR public.has_role(auth.uid(), 'super_admin')
);
CREATE POLICY "Admins can update requests" ON public.service_requests FOR UPDATE USING (
  public.has_role(auth.uid(), 'department_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.service_requests WHERE id = request_id AND citizen_id = auth.uid())
);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.service_requests WHERE id = request_id AND citizen_id = auth.uid())
);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (
  public.has_role(auth.uid(), 'department_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Admins can view all feedback" ON public.feedback FOR SELECT USING (
  public.has_role(auth.uid(), 'department_admin') OR public.has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for audit_logs
CREATE POLICY "Only super_admin can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Insert sample departments
INSERT INTO public.departments (name, description, email) VALUES
  ('Revenue Department', 'Handles land records, property tax, and certificates', 'revenue@gov.in'),
  ('Transport Department', 'Manages driving licenses and vehicle registrations', 'transport@gov.in'),
  ('Municipal Corporation', 'Provides birth/death certificates and civic services', 'municipal@gov.in');

-- Insert sample services
INSERT INTO public.services (department_id, name, description, fee, processing_time) VALUES
  ((SELECT id FROM public.departments WHERE name = 'Revenue Department'), 'Land Record Certificate', 'Get certified copy of land records', 50.00, '7 days'),
  ((SELECT id FROM public.departments WHERE name = 'Transport Department'), 'Driving License Renewal', 'Renew your expired driving license', 200.00, '15 days'),
  ((SELECT id FROM public.departments WHERE name = 'Municipal Corporation'), 'Birth Certificate', 'Obtain official birth certificate', 30.00, '5 days');