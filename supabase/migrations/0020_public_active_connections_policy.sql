-- Allow SELECT on connections table for active connections by any authenticated user
CREATE POLICY "connections_select_active" ON public.connections
  FOR SELECT USING (status = 'ACTIVE');

-- Allow SELECT on roommate_agreements table for confirmed agreements by any authenticated user
CREATE POLICY "agreements_select_confirmed" ON public.roommate_agreements
  FOR SELECT USING (status = 'CONFIRMED');
