import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://eigjsfnuexxzegklbrpe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZ2pzZm51ZXh4emVna2xicnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNTcyMDQsImV4cCI6MjA0NDczMzIwNH0.UthdXU4fE95rie81KHPq9eusPq2LjhSKc_DUkTwIUSk')
export default supabase;
