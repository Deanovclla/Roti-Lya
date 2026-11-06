// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://zrgsxasqmggfjcbybxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyZ3N4YXNxbWdnZmpjYnlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDgxNTAsImV4cCI6MjA5NjU4NDE1MH0.l7A2AAzKgOGW9XWRAnITsB9FsM30VAT17Z6s1aIfQHo'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);