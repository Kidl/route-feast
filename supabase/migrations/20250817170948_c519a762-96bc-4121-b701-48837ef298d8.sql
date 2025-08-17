-- Create missing tables for admin panel

-- Cancellation rules table
CREATE TABLE public.cancellation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hours_before integer NOT NULL DEFAULT 24,
  fee_type text NOT NULL DEFAULT 'percentage' CHECK (fee_type IN ('percentage', 'fixed')),
  fee_value numeric NOT NULL DEFAULT 0,
  message text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Message templates table
CREATE TABLE public.message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms')),
  subject text,
  body text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Booking events for audit trail
CREATE TABLE public.booking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Admin users table for role management  
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  permissions text[] DEFAULT '{"read", "write"}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.cancellation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admin users can manage cancellation rules" 
ON public.cancellation_rules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Admin users can manage message templates" 
ON public.message_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'write' = ANY(permissions)
));

CREATE POLICY "Admin users can view booking events" 
ON public.booking_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND 'read' = ANY(permissions)
));

CREATE POLICY "Admin users can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add trigger for updated_at
CREATE TRIGGER update_cancellation_rules_updated_at
  BEFORE UPDATE ON public.cancellation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default cancellation rule
INSERT INTO public.cancellation_rules (hours_before, fee_type, fee_value, message)
VALUES (24, 'percentage', 25, 'Kansellering mindre enn 24 timer før turen medfører 25% gebyr.');

-- Insert default message templates
INSERT INTO public.message_templates (name, channel, subject, body, variables) VALUES 
('booking_confirmation', 'email', 'Bekreftelse av booking - {{route_name}}', 
'Hei {{guest_name}},

Din booking er bekreftet!

Detaljer:
- Rute: {{route_name}}
- Dato og tid: {{datetime}}
- Antall personer: {{party_size}}
- Booking-referanse: {{booking_reference}}

Vi gleder oss til å se deg!

Mvh,
GastroRoute', 
ARRAY['guest_name', 'route_name', 'datetime', 'party_size', 'booking_reference']),

('booking_cancellation', 'email', 'Kansellering av booking - {{booking_reference}}',
'Hei {{guest_name}},

Din booking {{booking_reference}} er kansellert.

{{cancellation_message}}

Mvh,
GastroRoute',
ARRAY['guest_name', 'booking_reference', 'cancellation_message']);