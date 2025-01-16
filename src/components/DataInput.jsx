import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createClient } from '@supabase/supabase-js';
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    function DataInput() {
      const [income, setIncome] = useState('');
      const [essentialExpenses, setEssentialExpenses] = useState('');
      const [discretionarySpending, setDiscretionarySpending] = useState('');
      const [savings, setSavings] = useState('');
      const [debts, setDebts] = useState('');
      const [investments, setInvestments] = useState('');
      const [financialGoal, setFinancialGoal] = useState('');
      const [timeFrameInYears, setTimeFrameInYears] = useState('');
      const [riskTolerance, setRiskTolerance] = useState('medium');
      const [error, setError] = useState(null);
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [successMessage, setSuccessMessage] = useState(null);
      const navigate = useNavigate();
      if (!supabaseUrl || !supabaseKey || supabaseUrl === "YOUR_SUPABASE_URL" || supabaseKey === "YOUR_SUPABASE_ANON_KEY") {
        return <div className="error-message">Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the .env file.</div>;
      }
      const supabase = createClient(supabaseUrl, supabaseKey);
      useEffect(() => {
        const fetchUser = async () => {
          setLoading(true);
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) {
            setError(authError.message);
          } else {
            setUser(user);
          }
          setLoading(false);
        };
        fetchUser();
      }, []);
      const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
      };
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
          setError("User not authenticated.");
          return;
        }
        if (!income || !essentialExpenses || !discretionarySpending || !savings || !debts || !investments || !financialGoal || !timeFrameInYears || !riskTolerance) {
          setError("Please fill in all fields.");
          return;
        }
        const userData = {
          income: parseInt(income),
          essentialExpenses: parseInt(essentialExpenses),
          discretionarySpending: parseInt(discretionarySpending),
          savings: parseInt(savings),
          debts: parseInt(debts),
          investments: parseInt(investments),
          financialGoal: parseInt(financialGoal),
          timeFrameInYears: parseInt(timeFrameInYears),
          riskTolerance,
          user_id: user.id
        };
        setError(null);
        setSuccessMessage(null);
        let response;
        let insertData;
        try {
          const { data, error } = await supabase.from("financial_data").insert([userData]).select('id');
          if (error) {
            setError(`Failed to insert data: ${error.message}`);
            return;
          }
          if (!data || data.length === 0) {
            setError("Failed to insert data.");
            return;
          }
          insertData = data[0];
          setSuccessMessage("Your advisor is working on your financial data");
          setLoading(true);
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
              setError(`Webhook call failed: ${response.status} ${response.statusText}`);
              setLoading(false);
              return;
            }
            setTimeout(() => {
              setLoading(false);
              navigate(`/advice/${insertData.id}`);
            }, 21000);
          } catch (webhookError) {
            setError(`Error triggering webhook: ${webhookError.message}`);
            setLoading(false);
          }
        } catch (supabaseError) {
          setError(`Failed to insert data: ${supabaseError.message}`);
        }
      };
      if (loading) {
        return (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <button onClick={() => navigate('/input')}>Back</button>
          </div>
        );
      }
      if (!user) {
        return <div className="error-message">User not authenticated. Please sign in.</div>;
      }
      return (
        <div>
          <div className="dashboard-header">
            <h1>Enter Your Financial Data</h1>
            <div>
              <span>{user.email}</span>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          </div>
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Monthly Income:</label>
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Monthly Essential Expenses:</label>
              <input type="number" value={essentialExpenses} onChange={(e) => setEssentialExpenses(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Monthly Discretionary Spending:</label>
              <input type="number" value={discretionarySpending} onChange={(e) => setDiscretionarySpending(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Monthly Savings:</label>
              <input type="number" value={savings} onChange={(e) => setSavings(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Monthly Debt Repayments:</label>
              <input type="number" value={debts} onChange={(e) => setDebts(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Monthly Investments:</label>
              <input type="number" value={investments} onChange={(e) => setInvestments(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Financial Goal:</label>
              <input type="number" value={financialGoal} onChange={(e) => setFinancialGoal(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Time Frame (Years):</label>
              <input type="number" value={timeFrameInYears} onChange={(e) => setTimeFrameInYears(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Risk Tolerance:</label>
              <select value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit">Submit</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      );
    }
    export default DataInput;
