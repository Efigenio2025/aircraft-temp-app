diff --git a/src/supabaseClient.js b/src/supabaseClient.js
new file mode 100644
index 0000000000000000000000000000000000000000..950c514eef988337205f0fbd2b885e38211fb5ce
--- /dev/null
+++ b/src/supabaseClient.js
@@ -0,0 +1,16 @@
+import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
+
+export const DEFAULT_STATION = "OMA";
+
+export function getTodayDateString() {
+  return new Date().toISOString().slice(0, 10);
+}
+
+const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
+const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
+
+if (!supabaseUrl || !supabaseAnonKey) {
+  throw new Error("Missing Supabase environment variables.");
+}
+
+export const supabase = createClient(supabaseUrl, supabaseAnonKey);
