require('dotenv').config();
    const { createClient } = require("@supabase/supabase-js");
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl === "YOUR_SUPABASE_URL" || supabaseKey === "YOUR_SUPABASE_ANON_KEY") {
        console.error("Please replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' with your actual Supabase URL and key in the .env file.");
        return;
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    async function fetchAndDisplayAdvice() {
      const { data, error } = await supabase
        .from("financial_advice")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) {
        console.error("Error fetching advice:", error);
        return;
      }
      if (data && data.length > 0) {
        const advice = data[0];
        console.log("Financial Advice:");
        console.log("  Financial Health Score:", advice.financial_health_score);
        console.log("  Budget Recommendation:", advice.budget_recommendation);
        console.log("  Financial Goal Analysis:", advice.financial_goal_analysis);
        console.log("  Investment Advice:", advice.investment_advice);
      } else {
        console.log("No advice available yet.");
      }
    }
    fetchAndDisplayAdvice();
