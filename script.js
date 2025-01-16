import { createClient } from '@supabase/supabase-js';
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    const supabase = createClient(supabaseUrl, supabaseKey);
    async function handleAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const username = 'testuser';
        const password = 'testpassword';
        const { error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });
        if (error) {
          console.error("Error signing in:", error);
          return false;
        }
        console.log("User signed in successfully.");
        return true;
      } else {
        console.log("User is already signed in.");
        return true;
      }
    }
    async function collectAndStoreData() {
      const isLoggedIn = await handleAuth();
      if (!isLoggedIn) {
        console.log("Authentication failed. Please log in.");
        return;
      }
      const income = parseInt(prompt('Enter your monthly income: '));
      const essentialExpenses = parseInt(prompt('Enter your monthly essential expenses: '));
      const discretionarySpending = parseInt(prompt('Enter your monthly discretionary spending: '));
      const savings = parseInt(prompt('Enter your monthly savings: '));
      const debts = parseInt(prompt('Enter your monthly debt repayments: '));
      const investments = parseInt(prompt('Enter your monthly investments: '));
      const financialGoal = parseInt(prompt('Enter your financial goal: '));
      const timeFrameInYears = parseInt(prompt('Enter your time frame in years: '));
      const riskTolerance = prompt('Enter your risk tolerance (low, medium, high): ');
      const userData = {
        income,
        essentialExpenses,
        discretionarySpending,
        savings,
        debts,
        investments,
        financialGoal,
        timeFrameInYears,
        riskTolerance,
        user_id: supabase.auth.user().id
      };
      let insertData;
      try {
        const { data, error } = await supabase.from("financial_data").insert([userData]).select('id');
        if (error) {
          console.error("Error inserting data:", error);
          return;
        }
        if (!data || data.length === 0) {
          console.error("Failed to insert data.");
          return;
        }
        insertData = data[0];
        try {
          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: userData,
              financial_data_id: insertData.id
            }),
          });
          if (!response.ok) {
            console.error("Webhook call failed:", response.status, response.statusText);
            return;
          }
          console.log("Webhook triggered successfully");
        } catch (webhookError) {
          console.error("Error triggering webhook:", webhookError);
        }
        setTimeout(async () => {
          const { data, error } = await supabase
            .from("financial_advice")
            .select("*")
            .eq('financial_data_id', insertData.id)
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
        }, 15000);
      } catch (supabaseError) {
        console.error(`Failed to insert data: ${supabaseError.message}`);
      }
    }
    const root = document.getElementById('root');
    const auth = `
      <div class="auth-container">
        <h1>Welcome</h1>
        <button id="signInBtn">Sign In</button>
      </div>
    `;
    root.innerHTML = auth;
    document.getElementById('signInBtn').addEventListener('click', async () => {
      await collectAndStoreData();
    });
