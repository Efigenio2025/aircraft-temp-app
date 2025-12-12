diff --git a/src/supabaseClient.js b/src/supabaseClient.js
index 00b3e91bac80c3aede62952db60c37542a42925f..7876912f0c1006932901dedba0dc5744598f7630 100644
--- a/src/supabaseClient.js
+++ b/src/supabaseClient.js
@@ -1,22 +1,29 @@
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 export const DEFAULT_STATION = "OMA";
 
 export function getTodayDateString() {
   return new Date().toISOString().slice(0, 10);
 }
 
-const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
-const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
+const DEFAULT_SUPABASE_URL = "https://vzeklfluxzcdkccjklmd.supabase.co";
+const DEFAULT_SUPABASE_ANON_KEY =
+  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZWtsZmx1eHpjZGtjY2prbG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjYyNzUsImV4cCI6MjA4MTEwMjI3NX0.GJsXhcBJt1uL6qSDIoAved7CxPF5InFP8l43sBEXYCI";
+
+const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
+const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
+
+const supabaseUrl = envSupabaseUrl || DEFAULT_SUPABASE_URL;
+const supabaseAnonKey = envSupabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;
 
 export const supabaseAvailable = Boolean(supabaseUrl && supabaseAnonKey);
 
-if (!supabaseAvailable) {
-  console.warn(
-    "Supabase environment variables are missing. Supabase features will be disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided."
+if (!envSupabaseUrl || !envSupabaseAnonKey) {
+  console.info(
+    "Supabase environment variables are missing. Using default project URL and anon key."
   );
 }
 
 export const supabase = supabaseAvailable
   ? createClient(supabaseUrl, supabaseAnonKey)
   : null;
