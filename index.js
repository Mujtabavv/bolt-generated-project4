require('dotenv').config();
    const { createClient } = require("@supabase/supabase-js");
    const prompt = require('prompt-sync')();
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const webhookUrl = process.env.WEBHOOK_URL;
    if (supabaseUrl === "YOUR_SUPABASE_URL" || supabaseKey === "YOUR_SUPABASE_ANON_KEY") {
        console.error("Please replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' with your actual Supabase URL and key in the .env file.");
        return;
    }
    if (webhookUrl === "YOUR_WEBHOOK_URL") {
        console.error("Please replace 'YOUR_WEBHOOK_URL' with your actual webhook URL in the .env file.");
        return;
    }
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
      const { data, error } = await supabase.from("financial_data").insert([userData]);
      if (error) {
        console.error("Error inserting data:", error);
        return;
      }
      console.log("Data inserted successfully:", data);
      try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: userData,
            supabaseId: data[0].id,
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
    }
    collectAndStoreData();
