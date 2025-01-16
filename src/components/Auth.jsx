import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { createClient } from '@supabase/supabase-js';
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    function Auth() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState(null);
      const navigate = useNavigate();
      if (!supabaseUrl || !supabaseKey || supabaseUrl === "YOUR_SUPABASE_URL" || supabaseKey === "YOUR_SUPABASE_ANON_KEY") {
        return <div className="auth-container"><h1>Welcome</h1></div>;
      }
      const supabase = createClient(supabaseUrl, supabaseKey);
      const handleSignIn = async () => {
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          navigate('/input');
        }
      };
      const handleSignUp = async () => {
        setError(null);
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          navigate('/input');
        }
      };
      return (
        <div className="auth-container">
          <h1>Welcome</h1>
          <div className="auth-form">
            <div className="form-group">
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button onClick={handleSignIn}>Sign In</button>
            <button onClick={handleSignUp}>Sign Up</button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      );
    }
    export default Auth;
