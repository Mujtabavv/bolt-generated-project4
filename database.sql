CREATE TABLE profile (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      full_name TEXT
    );
    CREATE TABLE financial_data (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      user_id UUID REFERENCES auth.users(id),
      income INTEGER,
      essential_expenses INTEGER,
      discretionary_spending INTEGER,
      savings INTEGER,
      debts INTEGER,
      investments INTEGER,
      financial_goal INTEGER,
      time_frame_in_years INTEGER,
      risk_tolerance TEXT
    );
    CREATE TABLE financial_advice (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        financial_data_id UUID REFERENCES financial_data(id),
        financial_health_score INTEGER,
        budget_recommendation JSONB,
        financial_goal_analysis TEXT,
        investment_advice TEXT
    );
    ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only access their own financial data." ON financial_data
    FOR ALL USING (auth.uid() = user_id);
    ALTER TABLE financial_advice ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can only access financial advice related to their data." ON financial_advice
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM financial_data
        WHERE id = financial_data_id AND auth.uid() = user_id
      )
    );
    CREATE OR REPLACE FUNCTION public.create_user_profile()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    SECURITY DEFINER SET search_path = public
    AS $$
    BEGIN
      INSERT INTO public.profile (id)
      VALUES (NEW.id);
      RETURN NEW;
    END;
    $$;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_user_profile();
